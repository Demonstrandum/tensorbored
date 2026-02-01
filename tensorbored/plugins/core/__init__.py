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

"""TensorBoard core plugin utilities.

This package provides utilities for configuring TensorBoard from training scripts:

    from tensorbored.plugins.core import profile_writer, color_sampler

    # Generate perceptually uniform colors for runs
    run_ids = ['train', 'eval', 'test']
    run_colors = color_sampler.colors_for_runs(run_ids)

    # Set up a default TensorBoard profile
    profile_writer.set_default_profile(
        logdir='/path/to/logs',
        pinned_cards=[profile_writer.pin_scalar('loss')],
        run_colors=run_colors,
    )
"""

from tensorbored.plugins.core import color_sampler
from tensorbored.plugins.core import profile_writer

__all__ = ["color_sampler", "profile_writer"]
