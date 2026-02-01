#!/bin/sh
# Copyright 2022 The TensorFlow Authors. All Rights Reserved.
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

# Updates package version for release candidate (RC) builds.
# Sets version to X.Y.Zrc<timestamp> format for PyPI pre-releases.
# Uses Unix timestamp for uniqueness (allows multiple RCs per day).
# Example: 2.21.0rc1738425600
version="$(python tensorbored/version.py)"
case "${version}" in
  *a0)
    # Strip a0 suffix and add "rc" plus Unix timestamp.
    release="${version%a0}rc$(date +%s)"
    sed -i -e "s/${version}/${release}/" tensorbored/version.py
    ;;
  *)
    printf "error: found non-placeholder version %s\n" "${version}"
    exit 1
esac
