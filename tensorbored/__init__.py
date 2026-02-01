# Copyright 2017 The TensorFlow Authors. All Rights Reserved.
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
"""TensorBoard is a webapp for understanding TensorFlow runs and graphs."""

from tensorbored import lazy as _lazy
from tensorbored import version as _version

# TensorBoard public API.
__all__ = [
    "__version__",
    "errors",
    "notebook",
    "program",
    "summary",
]


# Please be careful when changing the structure of this file.
#
# The lazy imports in this file must use `importlib.import_module`, not
# `import tensorbored.foo` or `from tensorbored import foo`, or it will
# be impossible to reload the TensorBored module without breaking these
# top-level public APIs. This has to do with the gory details of
# Python's module system. Take `tensorbored.notebook` as an example:
#
#   - When the `tensorbored` module (that's us!) is initialized, its
#     `notebook` attribute is initialized to a new LazyModule. The
#     actual `tensorbored.notebook` submodule is not loaded.
#
#   - When the `tensorbored.notebook` submodule is first loaded, Python
#     _reassigns_ the `notebook` attribute on the `tensorbored` module
#     object to point to the underlying `tensorbored.notebook` module
#     object, rather than its former LazyModule value. This occurs
#     whether the module is loaded via the lazy module or directly as an
#     import:
#
#       - import tensorbored; tensorbored.notebook.start(...)  # one way
#       - from tensorbored import notebook  # other way; same effect
#
#   - When the `tensorbored` module is reloaded, its `notebook`
#     attribute is once again bound to a (new) LazyModule, while the
#     `tensorbored.notebook` module object is unaffected and still
#     exists in `sys.modules`. But then...
#
#   - When the new LazyModule is forced, it must resolve to the existing
#     `tensorbored.notebook` module object rather than itself (which
#     just creates a stack overflow). If the LazyModule load function
#     uses `import tensorbored.notebook; return tensorbored.notebook`,
#     then the first statement will do _nothing_ because the
#     `tensorbored.notebook` module is already loaded, and the second
#     statement will return the LazyModule itself. The same goes for the
#     `from tensorbored import notebook` form. We need to ensure that
#     the submodule is loaded and then pull the actual module object out
#     of `sys.modules`... which is exactly what `importlib` handles for
#     us.
#
# See <https://github.com/tensorflow/tensorboard/issues/1989> for
# additional discussion.


@_lazy.lazy_load("tensorbored.errors")
def errors():
    import importlib

    return importlib.import_module("tensorbored.errors")


@_lazy.lazy_load("tensorbored.notebook")
def notebook():
    import importlib

    return importlib.import_module("tensorbored.notebook")


@_lazy.lazy_load("tensorbored.program")
def program():
    import importlib

    return importlib.import_module("tensorbored.program")


@_lazy.lazy_load("tensorbored.summary")
def summary():
    import importlib

    return importlib.import_module("tensorbored.summary")


def load_ipython_extension(ipython):
    """IPython API entry point.

    Only intended to be called by the IPython runtime.

    See:
      https://ipython.readthedocs.io/en/stable/config/extensions/index.html
    """
    notebook._load_ipython_extension(ipython)


__version__ = _version.VERSION
