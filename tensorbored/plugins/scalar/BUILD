# Description:
# TensorBoard plugin for scalars

load("//tensorbored/defs:protos.bzl", "tb_proto_library")
load("@rules_python//python:py_binary.bzl", "py_binary")
load("@rules_python//python:py_library.bzl", "py_library")
load("@rules_python//python:py_test.bzl", "py_test")

package(default_visibility = ["//tensorbored:internal"])

licenses(["notice"])

## Scalars Plugin ##
py_library(
    name = "scalars_plugin",
    srcs = ["scalars_plugin.py"],
    srcs_version = "PY3",
    deps = [
        ":metadata",
        "//tensorbored:errors",
        "//tensorbored:plugin_util",
        "//tensorbored/backend:http_util",
        "//tensorbored/data:provider",
        "//tensorbored/plugins:base_plugin",
        "@org_pocoo_werkzeug",
    ],
)

py_test(
    name = "scalars_plugin_test",
    size = "medium",
    srcs = ["scalars_plugin_test.py"],
    main = "scalars_plugin_test.py",
    srcs_version = "PY3",
    deps = [
        ":scalars_plugin",
        ":summary",
        "//tensorbored:expect_tensorflow_installed",
        "//tensorbored/backend:application",
        "//tensorbored/backend/event_processing:data_provider",
        "//tensorbored/backend/event_processing:event_multiplexer",
        "//tensorbored/backend/event_processing:tag_types",
        "//tensorbored/compat/proto:protos_all_py_pb2",
        "//tensorbored/plugins:base_plugin",
        "//tensorbored/util:test_util",
        "@org_pocoo_werkzeug",
    ],
)

# TODO(#2007): Remove this after pruning unnecessary TensorFlow deps in main test
py_test(
    name = "scalars_plugin_notf_test",
    size = "small",
    srcs = ["scalars_plugin_test.py"],
    main = "scalars_plugin_test.py",
    srcs_version = "PY3",
    deps = [
        ":scalars_plugin",
        ":summary",
        "//tensorbored:expect_tensorflow_installed",
        "//tensorbored/backend:application",
        "//tensorbored/backend/event_processing:data_provider",
        "//tensorbored/backend/event_processing:event_multiplexer",
        "//tensorbored/backend/event_processing:tag_types",
        "//tensorbored/compat:no_tensorflow",
        "//tensorbored/compat/proto:protos_all_py_pb2",
        "//tensorbored/plugins:base_plugin",
        "//tensorbored/util:test_util",
        "@org_pocoo_werkzeug",
    ],
)

py_binary(
    name = "scalars_demo",
    srcs = ["scalars_demo.py"],
    srcs_version = "PY3",
    deps = [
        ":summary",
        "//tensorbored:expect_tensorflow_installed",
    ],
)

py_binary(
    name = "scalars_demo_eager",
    srcs = ["scalars_demo_eager.py"],
    srcs_version = "PY3",
    deps = [
        ":summary",
        "//tensorbored:expect_tensorflow_installed",
    ],
)

py_library(
    name = "summary",
    srcs = ["summary.py"],
    srcs_version = "PY3",
    deps = [
        ":metadata",
        ":summary_v2",
        "//tensorbored:expect_tensorflow_installed",
    ],
)

py_library(
    name = "summary_v2",
    srcs = ["summary_v2.py"],
    srcs_version = "PY3",
    visibility = [
        "//tensorbored:internal",
    ],
    deps = [
        ":metadata",
        "//tensorbored/compat",
        "//tensorbored/compat/proto:protos_all_py_pb2",
        "//tensorbored/util:tensor_util",
    ],
)

py_test(
    name = "summary_test",
    size = "small",
    srcs = ["summary_test.py"],
    srcs_version = "PY3",
    deps = [
        ":metadata",
        ":summary",
        "//tensorbored:expect_numpy_installed",
        "//tensorbored:expect_tensorflow_installed",
        "//tensorbored/compat/proto:protos_all_py_pb2",
        "//tensorbored/util:tensor_util",
    ],
)

py_library(
    name = "metadata",
    srcs = ["metadata.py"],
    srcs_version = "PY3",
    visibility = [
        "//tensorbored:internal",
    ],
    deps = [
        ":protos_all_py_pb2",
        "//tensorbored/compat/proto:protos_all_py_pb2",
    ],
)

tb_proto_library(
    name = "protos_all",
    srcs = ["plugin_data.proto"],
)
