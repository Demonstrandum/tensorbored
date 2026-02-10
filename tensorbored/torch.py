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
"""Convenience re-export of PyTorch's TensorBoard integration.

Usage::

    from tensorbored.torch import SummaryWriter

This is equivalent to::

    from torch.utils.tensorboard import SummaryWriter

but guarantees that the ``tensorboard`` → ``tensorbored`` module alias is
active *before* PyTorch tries to ``import tensorboard``.  With this
single import there is no need to install the original ``tensorboard``
package — ``tensorbored`` alone is enough.

Requires PyTorch (``torch``) to be installed.
"""

# Importing this module already triggered ``tensorbored.__init__``, which
# installed the ``tensorboard`` module alias.  PyTorch's
# ``torch.utils.tensorboard`` can now find ``tensorboard`` in
# ``sys.modules`` and everything resolves to *tensorbored*.

from torch.utils.tensorboard import *  # noqa: F401,F403
from torch.utils.tensorboard import SummaryWriter  # explicit for type-checkers

__all__ = ["SummaryWriter"]
