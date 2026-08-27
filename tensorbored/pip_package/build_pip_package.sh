#!/bin/sh
# Copyright 2015 The TensorFlow Authors. All Rights Reserved.
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

usage() {
  cat <<EOF
usage: build_pip_package OUTPUT_DIR

Build TensorBoard Pip packages and store the resulting wheel files
into OUTPUT (a directory or "tar.gz" path).

Arguments:
  OUTPUT: A path ending in ".tar.gz" for the output archive, or else a
    path to an existing directory into which to store the wheel files
    directly.
EOF
}

# Resolve an apparent repository path through Bazel's Bzlmod runfiles mapping.
# See https://bazel.build/external/overview#concepts for the distinction between
# apparent and canonical repository names.
# WORKSPACE runfiles use the apparent name as their directory, while module
# extension repositories use a canonical name such as
# `_main~tensorboard_python_dependencies~org_mozilla_bleach`.
runfile_path() {
  apparent_path="$1"
  apparent_repo="${apparent_path%%/*}"
  repo_relative_path="${apparent_path#*/}"

  if [ -f "${RUNFILES}/_repo_mapping" ]; then
    canonical_repo="$(
      awk -F, -v apparent_repo="${apparent_repo}" \
        '($1 == "" || $1 == "_main") && $2 == apparent_repo { print $3; exit }' \
        "${RUNFILES}/_repo_mapping"
    )"
    if [ -n "${canonical_repo}" ] &&
        [ -e "${RUNFILES}/${canonical_repo}/${repo_relative_path}" ]; then
      printf '%s\n' "${RUNFILES}/${canonical_repo}/${repo_relative_path}"
      return 0
    fi
  fi

  # Compatibility with legacy WORKSPACE runfiles and runfiles trees without a
  # repository mapping file.
  if [ -e "${RUNFILES}/${apparent_path}" ]; then
    printf '%s\n' "${RUNFILES}/${apparent_path}"
    return 0
  fi

  printf >&2 'fatal: runfile not found: %s\n' "${apparent_path}"
  return 1
}

main() {
  if [ $# -ne 1 ]; then
    usage 2>&1
    return 1
  fi
  output="$1"

  if [ -z "${RUNFILES+set}" ]; then
    RUNFILES="$(CDPATH="" cd -- "$0.runfiles" && pwd)"
  fi
  if [ -d "${RUNFILES}/_main/tensorbored" ]; then
    TENSORBOARD_RUNFILES="${RUNFILES}/_main"
  else
    # Compatibility with the legacy WORKSPACE runfiles layout.
    TENSORBOARD_RUNFILES="${RUNFILES}/org_tensorbored"
  fi

  if [ "$(uname)" = "Darwin" ]; then
    workdir="$(mktemp -d -t tensorboard-pip)"
  else
    workdir="$(mktemp -d -p /tmp -t tensorboard-pip.XXXXXXXXXX)"
  fi
  original_wd="${PWD}"
  cd "${workdir}" || return 2

  cleanup() {
    rm -r "${workdir}"
  }
  trap cleanup EXIT

  log_file="${workdir}/log"
  build >"${log_file}" 2>&1
  exit_code=$?
  if [ "${exit_code}" -ne 0 ]; then
    cat "${log_file}" >&2
  fi
  return "${exit_code}"
}

build() (
  set -eux
  if [ "$(uname)" = "Darwin" ]; then
    sedi="sed -i ''"
  else
    sedi="sed -i"
  fi

  command -v virtualenv >/dev/null
  [ -d "${RUNFILES}" ]

  cp -LR "${TENSORBOARD_RUNFILES}/tensorbored" .
  mv -f "tensorbored/pip_package/LICENSE" .
  mv -f "tensorbored/pip_package/MANIFEST.in" .
  mv -f "tensorbored/pip_package/README.rst" .
  mv -f "tensorbored/pip_package/requirements.txt" .
  mv -f "tensorbored/pip_package/setup.cfg" .
  mv -f "tensorbored/pip_package/setup.py" .
  rm -rf "tensorbored/pip_package"

  rm -f tensorbored/tensorbored  # bazel py_binary sh wrapper
  chmod -x LICENSE  # bazel symlinks confuse cp
  find . -name __init__.py -exec chmod -x {} +  # which goes for all genfiles

  mkdir -p tensorbored/_vendor
  >tensorbored/_vendor/__init__.py
  cp -LR "$(runfile_path org_mozilla_bleach/bleach)" tensorbored/_vendor
  cp -LR "$(runfile_path org_pythonhosted_webencodings/webencodings)" \
    tensorbored/_vendor

  chmod -R u+w,go+r .

  find tensorbored -name \*.py -exec $sedi -e '
      s/^import bleach$/from tensorbored._vendor import bleach/
      s/^from bleach/from tensorbored._vendor.bleach/
      s/^import webencodings$/from tensorbored._vendor import webencodings/
      s/^from webencodings/from tensorbored._vendor.webencodings/
    ' {} +

  virtualenv -q -p python3 venv
  export VIRTUAL_ENV=venv
  export PATH="${PWD}/venv/bin:${PATH}"
  unset PYTHON_HOME

  # Require wheel for bdist_wheel command, and setuptools 36.2.0+ so that
  # env markers are handled (https://github.com/pypa/setuptools/pull/1081)
  export PYTHONWARNINGS=ignore:DEPRECATION  # suppress Python 2.7 deprecation spam
  pip install -qU wheel 'setuptools>=36.2.0'

  # Overrides file timestamps in the zip archive to make the build
  # reproducible. (Date is mostly arbitrary, but must be past 1980 to be
  # representable in a zip archive.)
  export SOURCE_DATE_EPOCH=1577836800  # 2020-01-01T00:00:00Z

  python setup.py bdist_wheel --python-tag py3 >/dev/null

  cd "${original_wd}"  # Bazel gives "${output}" as a relative path >_>
  case "${output}" in
    *.tar.gz)
      mkdir -p "$(dirname "${output}")"
      "${TENSORBOARD_RUNFILES}/tensorbored/pip_package/deterministic_tar_gz" \
          "${output}" "${workdir}"/dist/*.whl
      ;;
    *)
      if ! [ -d "${output}" ]; then
        printf >&2 'fatal: no such output directory: %s\n' "${output}"
        return 1
      fi
      mv "${workdir}"/dist/*.whl "${output}"
      ;;
  esac
)

main "$@"
