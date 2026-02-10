# Copyright 2025 The TensorBored Authors. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# ==============================================================================
"""Expose *tensorbored* under the ``tensorboard`` alias.

When the real ``tensorboard`` package is **not** installed, this module
installs a :pep:`302` meta-path finder that transparently redirects every
``import tensorboard`` (and ``import tensorboard.*``) to the corresponding
``tensorbored`` module.  This lets libraries that hard-code
``from tensorboard.summary.writer …`` — most notably PyTorch's
``torch.utils.tensorboard`` — work with only *tensorbored* on ``sys.path``.

The alias is installed once, at ``tensorbored`` package init time
(see ``tensorbored/__init__.py``).  If the real ``tensorboard`` *is*
installed, nothing is changed and the original package is used as-is.
"""

import importlib
import importlib.machinery
import importlib.util
import sys


_PREFIX = "tensorboard"
_TARGET = "tensorbored"


def _real_tensorboard_is_installed() -> bool:
    """Return *True* if a genuine ``tensorboard`` package exists on
    ``sys.path`` (i.e. one that was **not** planted by us)."""

    # We must check *before* our finder is on sys.meta_path, or our own
    # finder would answer "yes".  When called from install() below that
    # invariant holds; guard against mis-use with an explicit filter.
    original_meta_path = [
        f for f in sys.meta_path if not isinstance(f, _AliasImporter)
    ]
    saved = sys.meta_path[:]
    sys.meta_path[:] = original_meta_path
    try:
        return importlib.util.find_spec(_PREFIX) is not None
    finally:
        sys.meta_path[:] = saved


class _NoopLoader:
    """Loader that returns an already-loaded module unchanged.

    ``create_module`` hands back the pre-loaded *tensorbored* module so
    that the import machinery adopts it as-is under the *tensorboard*
    alias name.  ``exec_module`` is intentionally empty — the module is
    already fully initialised.

    This is a plain class (not an ``importlib.abc.Loader`` subclass) to
    avoid any interaction with the ABC's default method stubs.
    """

    __slots__ = ("_mod",)

    def __init__(self, mod):
        self._mod = mod

    def create_module(self, spec):
        return self._mod

    def exec_module(self, module):
        pass


class _AliasImporter:
    """Meta-path finder that maps ``tensorboard.*`` → ``tensorbored.*``.

    When the finder intercepts ``import tensorboard.X.Y``, it:

    1. Eagerly imports the real ``tensorbored.X.Y`` module (which may
       already be cached in ``sys.modules``).
    2. Returns a :class:`~importlib.machinery.ModuleSpec` whose loader
       (``_NoopLoader``) simply hands the already-loaded module back to
       the import machinery via ``create_module``.

    This ensures every ``tensorboard.*`` entry in ``sys.modules`` is the
    *exact same object* as its ``tensorbored.*`` counterpart — no
    duplicate module state, no broken ``isinstance`` checks.

    **Important:** ``find_spec`` must NOT pre-populate
    ``sys.modules[fullname]``.  Doing so causes CPython's frozen
    ``_load_unlocked`` to take an internal fast-path that bypasses the
    loader entirely and creates a *new* module object from the file on
    disk, defeating the whole purpose of the alias.
    """

    def find_spec(self, fullname, path, target=None):
        if fullname != _PREFIX and not fullname.startswith(_PREFIX + "."):
            return None

        real_name = _TARGET + fullname[len(_PREFIX) :]

        # Ensure the real module is loaded.
        try:
            importlib.import_module(real_name)
        except ImportError:
            return None

        mod = sys.modules[real_name]

        return importlib.machinery.ModuleSpec(
            fullname,
            loader=_NoopLoader(mod),
            origin=getattr(mod, "__file__", None),
            is_package=hasattr(mod, "__path__"),
        )


def _sync_existing_aliases() -> None:
    """Copy every ``tensorbored.*`` entry already in ``sys.modules`` to a
    parallel ``tensorboard.*`` entry.

    Called once at install time so that modules loaded during
    ``tensorbored.__init__`` (e.g. ``tensorbored.version``) are
    immediately visible under the alias without going through the
    finder.
    """
    prefix_dot = _TARGET + "."
    for key in list(sys.modules):
        if key == _TARGET or key.startswith(prefix_dot):
            alias_key = _PREFIX + key[len(_TARGET) :]
            sys.modules.setdefault(alias_key, sys.modules[key])


def install() -> None:
    """Install the ``tensorboard`` → ``tensorbored`` alias.

    Safe to call more than once; the finder is only added to
    ``sys.meta_path`` a single time and only when the real
    ``tensorboard`` package is absent.
    """
    if _real_tensorboard_is_installed():
        return

    if any(isinstance(f, _AliasImporter) for f in sys.meta_path):
        return  # already installed

    # Prepend so we intercept ``tensorboard.*`` before the default
    # ``PathFinder`` can create duplicate module objects from the same
    # source files.
    sys.meta_path.insert(0, _AliasImporter())

    # Eagerly alias everything already loaded (at minimum the top-level
    # ``tensorbored`` package itself, plus ``tensorbored.version`` etc.
    # that were imported during ``__init__``).
    _sync_existing_aliases()
