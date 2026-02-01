# Description:
# TensorBoard plugin for hparams

load("//tensorbored/defs:defs.bzl", "tf_ts_library")
load("//tensorbored/defs:web.bzl", "tf_web_library")
load("//tensorbored/defs:protos.bzl", "tb_proto_library")
load("@rules_python//python:py_binary.bzl", "py_binary")
load("@rules_python//python:py_library.bzl", "py_library")
load("@rules_python//python:py_test.bzl", "py_test")

package(default_visibility = ["//tensorbored:internal"])

licenses(["notice"])

# Public-facing API, included in Pip package.
py_library(
    name = "hparams",
    srcs = ["__init__.py"],
    srcs_version = "PY3",
    visibility = ["//visibility:public"],
    deps = [
        ":api",
        ":summary",
        ":summary_v2",
    ],
)

py_library(
    name = "hparams_plugin",
    srcs = [
        "backend_context.py",
        "download_data.py",
        "get_experiment.py",
        "hparams_plugin.py",
        "json_format_compat.py",
        "list_metric_evals.py",
        "list_session_groups.py",
        "metrics.py",
    ],
    srcs_version = "PY3",
    deps = [
        ":error",
        ":metadata",
        ":protos_all_py_pb2",
        "//tensorbored:expect_protobuf_installed",
        "//tensorbored:plugin_util",
        "//tensorbored/backend:http_util",
        "//tensorbored/data:provider",
        "//tensorbored/plugins:base_plugin",
        "//tensorbored/plugins/scalar:metadata",
        "//tensorbored/plugins/scalar:scalars_plugin",
        "//tensorbored/util:tb_logging",
        "//tensorbored/util:tensor_util",
        "@org_pocoo_werkzeug",
    ],
)

py_test(
    name = "download_data_test",
    size = "small",
    srcs = [
        "download_data_test.py",
    ],
    deps = [
        ":hparams_plugin",
        "//tensorbored:expect_protobuf_installed",
        "//tensorbored:expect_tensorflow_installed",
        "//tensorbored/backend/event_processing:event_accumulator",
        "//tensorbored/backend/event_processing:event_multiplexer",
    ],
)

py_test(
    name = "list_session_groups_test",
    size = "small",
    timeout = "moderate",
    srcs = [
        "list_session_groups_test.py",
    ],
    deps = [
        ":hparams_plugin",
        "//tensorbored:context",
        "//tensorbored:expect_protobuf_installed",
        "//tensorbored:expect_tensorflow_installed",
        "//tensorbored/backend/event_processing:data_provider",
        "//tensorbored/backend/event_processing:event_accumulator",
        "//tensorbored/backend/event_processing:event_multiplexer",
        "//tensorbored/compat/proto:protos_all_py_pb2",
        "//tensorbored/plugins/scalar:metadata",
    ],
)

py_test(
    name = "list_metric_evals_test",
    size = "small",
    srcs = [
        "list_metric_evals_test.py",
    ],
    deps = [
        ":hparams_plugin",
        "//tensorbored:context",
        "//tensorbored:expect_protobuf_installed",
        "//tensorbored:expect_tensorflow_installed",
    ],
)

py_test(
    name = "backend_context_test",
    size = "small",
    srcs = [
        "backend_context_test.py",
    ],
    deps = [
        ":hparams_plugin",
        "//tensorbored:context",
        "//tensorbored:expect_protobuf_installed",
        "//tensorbored:expect_tensorflow_installed",
        "//tensorbored/data:provider",
    ],
)

py_test(
    name = "json_format_compat_test",
    size = "small",
    srcs = [
        "json_format_compat_test.py",
    ],
    deps = [
        ":hparams_plugin",
        "//tensorbored:expect_absl_testing_absltest_installed",
    ],
)

py_binary(
    name = "hparams_demo",
    srcs = ["hparams_demo.py"],
    srcs_version = "PY3",
    deps = [
        ":api",
        ":protos_all_py_pb2",
        ":summary",
        "//tensorbored:expect_absl_app_installed",
        "//tensorbored:expect_absl_flags_installed",
        "//tensorbored:expect_numpy_installed",
        "//tensorbored:expect_tensorflow_installed",
        "//tensorbored/plugins/scalar:summary",
    ],
)

py_binary(
    name = "hparams_minimal_demo",
    srcs = ["hparams_minimal_demo.py"],
    srcs_version = "PY3",
    deps = [
        ":protos_all_py_pb2",
        ":summary",
        "//tensorbored:expect_absl_app_installed",
        "//tensorbored:expect_absl_flags_installed",
        "//tensorbored:expect_protobuf_installed",
        "//tensorbored:expect_tensorflow_installed",
        "//tensorbored/plugins/scalar:summary",
    ],
)

py_binary(
    name = "hparams_util",
    srcs = ["hparams_util.py"],
    srcs_version = "PY3",
    visibility = [
        "//visibility:public",
    ],
    deps = [
        ":protos_all_py_pb2",
        ":summary",
        "//tensorbored:expect_absl_app_installed",
        "//tensorbored:expect_absl_flags_installed",
        "//tensorbored:expect_protobuf_installed",
        "//tensorbored:expect_tensorflow_installed",
    ],
)

sh_test(
    name = "hparams_util_test",
    srcs = ["hparams_util_test.sh"],
    data = [
        ":hparams_util",
    ],
)

py_library(
    name = "api",
    srcs = ["api.py"],
    srcs_version = "PY3",
    visibility = [
        "//visibility:public",
    ],
    deps = [
        ":keras",
        ":summary_v2",
    ],
)

py_test(
    name = "api_test",
    size = "small",
    srcs = ["api_test.py"],
    srcs_version = "PY3",
    deps = [
        ":api",
        ":keras",
        ":summary_v2",
        "//tensorbored:test",
    ],
)

py_library(
    name = "keras",
    srcs = ["_keras.py"],
    srcs_version = "PY3",
    deps = [
        ":protos_all_py_pb2",
        ":summary",
        ":summary_v2",
        "//tensorbored:expect_tensorflow_installed",
    ],
)

py_test(
    name = "keras_test",
    size = "small",
    srcs = ["_keras_test.py"],
    main = "_keras_test.py",
    srcs_version = "PY3",
    deps = [
        ":api",
        ":keras",
        ":metadata",
        ":protos_all_py_pb2",
        ":summary_v2",
        "//tensorbored:expect_protobuf_installed",
        "//tensorbored:expect_tensorflow_installed",
    ],
)

py_library(
    name = "summary_v2",
    srcs = ["summary_v2.py"],
    srcs_version = "PY3",
    deps = [
        ":metadata",
        ":protos_all_py_pb2",
        "//tensorbored:expect_numpy_installed",
        "//tensorbored/compat",
        "//tensorbored/compat/proto:protos_all_py_pb2",
    ],
)

py_test(
    name = "summary_v2_test",
    size = "small",
    srcs = ["summary_v2_test.py"],
    srcs_version = "PY3",
    deps = [
        ":metadata",
        ":protos_all_py_pb2",
        ":summary_v2",
        "//tensorbored:expect_numpy_installed",
        "//tensorbored:expect_protobuf_installed",
        "//tensorbored:expect_tensorflow_installed",
        "//tensorbored:test",
        "//tensorbored/compat/proto:protos_all_py_pb2",
    ],
)

py_test(
    name = "summary_v2_notf_test",
    size = "small",
    srcs = ["summary_v2_test.py"],
    main = "summary_v2_test.py",
    srcs_version = "PY3",
    tags = ["support_notf"],
    deps = [
        ":metadata",
        ":protos_all_py_pb2",
        ":summary_v2",
        "//tensorbored:expect_numpy_installed",
        "//tensorbored:expect_protobuf_installed",
        "//tensorbored:test",
        "//tensorbored/compat:no_tensorflow",
        "//tensorbored/compat/proto:protos_all_py_pb2",
    ],
)

py_library(
    name = "summary",
    srcs = ["summary.py"],
    srcs_version = "PY3",
    visibility = [
        "//visibility:public",
    ],
    deps = [
        ":metadata",
        ":protos_all_py_pb2",
        "//tensorbored:expect_tensorflow_installed",
        "//tensorbored/compat/proto:protos_all_py_pb2",
    ],
)

py_test(
    name = "summary_test",
    srcs = ["summary_test.py"],
    srcs_version = "PY3",
    deps = [
        ":protos_all_py_pb2",
        ":summary",
        "//tensorbored:expect_protobuf_installed",
        "//tensorbored:expect_tensorflow_installed",
    ],
)

py_library(
    name = "metadata",
    srcs = ["metadata.py"],
    srcs_version = "PY3",
    deps = [
        ":error",
        ":protos_all_py_pb2",
        "//tensorbored/compat/proto:protos_all_py_pb2",
        "//tensorbored/util:tensor_util",
    ],
)

py_library(
    name = "error",
    srcs = ["error.py"],
    srcs_version = "PY3",
)

tb_proto_library(
    name = "protos_all",
    srcs = [
        "api.proto",
        "hparams_util.proto",
        "plugin_data.proto",
    ],
    visibility = ["//visibility:public"],
)

tf_web_library(
    name = "api_d_ts",
    srcs = [
        "api.d.ts",
    ],
    path = "/tf-hparams",
)

tf_ts_library(
    name = "types",
    srcs = [
        "types.ts",
    ],
)
