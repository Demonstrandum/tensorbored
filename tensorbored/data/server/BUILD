load("@rules_python//python:py_binary.bzl", "py_binary")
load("@rules_python//python:py_test.bzl", "py_test")
load("@rules_rust//rust:defs.bzl", "rust_binary", "rust_doc", "rust_doc_test", "rust_library", "rust_test")

package(default_visibility = ["//tensorbored:internal"])

licenses(["notice"])

# Protocol buffer packages (as in `package foo.bar;` directives) that we need
# to compile to Rust bindings.
_proto_packages = [
    "tensorboard",
    "tensorboard.data",
]

# Generated files with Rust protobuf bindings. These only exist in the build
# graph, not in the source tree. The file name pattern is specified by Prost
# and must match the output of `prost_build`.
_genproto_files = ["genproto/%s.rs" % pkg for pkg in _proto_packages]

_generated_file_descriptor_set = "genproto/descriptor.bin"

# Source files with Rust protobuf bindings. These are automatically
# materialized in the source tree from the generated bindings by the
# `:update_protos` script, and kept in sync via `:update_protos_test`. These
# don't match the raw generated code exactly: e.g., we add license headers.
_checked_in_proto_files = ["%s.pb.rs" % pkg for pkg in _proto_packages]

_checked_in_file_descriptor_set = "descriptor.bin"

rust_library(
    name = "rustboard_core",
    srcs = [
        "blob_key.rs",
        "cli.rs",
        "cli/dynamic_logdir.rs",
        "commit.rs",
        "data_compat.rs",
        "disk_logdir.rs",
        "downsample.rs",
        "event_file.rs",
        "gcs.rs",
        "gcs/auth.rs",
        "gcs/client.rs",
        "gcs/logdir.rs",
        "lib.rs",
        "logdir.rs",
        "masked_crc.rs",
        "reservoir.rs",
        "run.rs",
        "scripted_reader.rs",
        "server.rs",
        "tf_record.rs",
        "types.rs",
        "writer.rs",
    ] + _checked_in_proto_files,
    compile_data = [_checked_in_file_descriptor_set],
    edition = "2018",
    deps = [
        "//tensorbored/data/server/cargo:async_stream",
        "//tensorbored/data/server/cargo:base64",
        "//tensorbored/data/server/cargo:byteorder",
        "//tensorbored/data/server/cargo:bytes",
        "//tensorbored/data/server/cargo:clap",
        "//tensorbored/data/server/cargo:crc",
        "//tensorbored/data/server/cargo:env_logger",
        "//tensorbored/data/server/cargo:futures_core",
        "//tensorbored/data/server/cargo:gcp_auth",
        "//tensorbored/data/server/cargo:log",
        "//tensorbored/data/server/cargo:prost",
        "//tensorbored/data/server/cargo:prost_types",
        "//tensorbored/data/server/cargo:rand",
        "//tensorbored/data/server/cargo:rand_chacha",
        "//tensorbored/data/server/cargo:rayon",
        "//tensorbored/data/server/cargo:reqwest",
        "//tensorbored/data/server/cargo:serde",
        "//tensorbored/data/server/cargo:serde_json",
        "//tensorbored/data/server/cargo:thiserror",
        "//tensorbored/data/server/cargo:tokio",
        "//tensorbored/data/server/cargo:tokio_stream",
        "//tensorbored/data/server/cargo:tonic",
        "//tensorbored/data/server/cargo:tonic_reflection",
        "//tensorbored/data/server/cargo:walkdir",
    ],
)

rust_test(
    name = "rustboard_core_test",
    compile_data = [_checked_in_file_descriptor_set],
    crate = ":rustboard_core",
    deps = [
        "//tensorbored/data/server/cargo:tempfile",
    ],
)

rust_binary(
    name = "bench",
    srcs = ["bench.rs"],
    edition = "2018",
    deps = [
        ":rustboard_core",
        "//tensorbored/data/server/cargo:clap",
        "//tensorbored/data/server/cargo:env_logger",
        "//tensorbored/data/server/cargo:log",
        "//tensorbored/data/server/cargo:rayon",
    ],
)

rust_binary(
    name = "gsutil",
    srcs = ["gcs/gsutil.rs"],
    edition = "2018",
    deps = [
        ":rustboard_core",
        "//tensorbored/data/server/cargo:clap",
        "//tensorbored/data/server/cargo:env_logger",
        "//tensorbored/data/server/cargo:log",
    ],
)

rust_doc_test(
    name = "rustboard_core_doc_test",
    crate = ":rustboard_core",
    tags = ["manual"],  # https://github.com/bazelbuild/rules_rust/issues/689
)

rust_doc(
    name = "rustboard_core_doc",
    crate = ":rustboard_core",
    tags = ["manual"],  # https://github.com/bazelbuild/rules_rust/issues/689
)

py_binary(
    name = "rustboard_core_doc_server",
    srcs = ["rustboard_core_doc_server.py"],
    data = [":rustboard_core_doc.zip"],
    python_version = "PY3",
    srcs_version = "PY3",
    tags = ["manual"],  # https://github.com/bazelbuild/rules_rust/issues/689
    deps = [
        "@org_pocoo_werkzeug",
    ],
)

rust_binary(
    name = "server",
    srcs = ["main.rs"],
    edition = "2018",
    deps = [
        ":rustboard_core",
    ],
)

genrule(
    name = "gen_protos",
    srcs = [
        "//tensorbored/compat/proto:proto_srcs",
        "//tensorbored/data/proto:proto_srcs",
        "//tensorbored/plugins/audio:proto_srcs",
        "//tensorbored/plugins/image:proto_srcs",
        "@com_google_protobuf//:well_known_protos",
    ],
    outs = _genproto_files + [_generated_file_descriptor_set],
    cmd = """
        die() { printf >&2 'fatal: %s\\n' "$$@"; exit 1; }
        export PROTOC=$(execpath @com_google_protobuf//:protoc)
        # The `:well_known_protos` fileset has source files in the `src/`
        # directory under the genfiles tree for its workspace. Bazel variable
        # expansion doesn't provide a way to get that directly (it's not a
        # target), but we can extract it from the files themselves.
        f=
        for f in $(locations @com_google_protobuf//:well_known_protos); do
            break  # just take one arbitrarily
        done
        [ -n "$${f}" ] || die 'no well-known protos in fileset'
        parent_of_src="$${f%/src/*}"
        if [ "$${parent_of_src}" = "$${f}" ]; then
            die 'no `src` directory found for proto: '"$${f}"
        fi
        export PROTOC_INCLUDE="$${parent_of_src}/src"
        exec $(execpath :gen_protos_tool) $(RULEDIR)
    """,
    tools = [
        ":gen_protos_tool",
        "@com_google_protobuf//:protoc",
    ],
)

rust_binary(
    name = "gen_protos_tool",
    srcs = ["gen_protos_tool.rs"],
    edition = "2018",
    visibility = ["//visibility:private"],
    deps = [
        "//tensorbored/data/server/cargo:prost_build",
        "//tensorbored/data/server/cargo:tonic_build",
    ],
)

py_binary(
    name = "update_protos",
    srcs = ["update_protos.py"],
    args = ["--update"] + _proto_packages + ["descriptor.bin"],
    data = _genproto_files + [_generated_file_descriptor_set],
    python_version = "PY3",
    srcs_version = "PY3",
)

py_test(
    name = "update_protos_test",
    srcs = ["update_protos.py"],
    args = ["--check"] + _proto_packages + ["descriptor.bin"],
    data = _genproto_files + _checked_in_proto_files + [
        _generated_file_descriptor_set,
        _checked_in_file_descriptor_set,
    ],
    main = "update_protos.py",
    python_version = "PY3",
    srcs_version = "PY3",
)
