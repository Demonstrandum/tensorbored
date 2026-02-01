# Description:
# TensorBoard plugin for the Text

load("//tensorbored/defs:protos.bzl", "tb_proto_library")
load("@rules_python//python:py_binary.bzl", "py_binary")
load("@rules_python//python:py_library.bzl", "py_library")
load("@rules_python//python:py_test.bzl", "py_test")

package(default_visibility = ["//tensorbored:internal"])

licenses(["notice"])

## Text Plugin ##
py_library(
    name = "text_plugin",
    srcs = ["text_plugin.py"],
    srcs_version = "PY3",
    deps = [
        ":metadata",
        "//tensorbored:plugin_util",
        "//tensorbored/backend:http_util",
        "//tensorbored/data:provider",
        "//tensorbored/plugins:base_plugin",
        "@org_pocoo_werkzeug",
        "@org_pythonhosted_markdown",
    ],
)

py_test(
    name = "text_plugin_test",
    size = "small",
    srcs = ["text_plugin_test.py"],
    main = "text_plugin_test.py",
    srcs_version = "PY3",
    deps = [
        ":text_plugin",
        "//tensorbored:context",
        "//tensorbored:expect_tensorflow_installed",
        "//tensorbored:plugin_util",
        "//tensorbored/backend/event_processing:data_provider",
        "//tensorbored/backend/event_processing:event_multiplexer",
        "//tensorbored/plugins:base_plugin",
        "//tensorbored/util:test_util",
        "@org_pocoo_werkzeug",
    ],
)

# TODO(#2007): Remove this after pruning unnecessary TensorFlow deps in main test
py_test(
    name = "text_plugin_notf_test",
    size = "small",
    srcs = ["text_plugin_test.py"],
    main = "text_plugin_test.py",
    srcs_version = "PY3",
    deps = [
        ":text_plugin",
        "//tensorbored:context",
        "//tensorbored:expect_tensorflow_installed",
        "//tensorbored:plugin_util",
        "//tensorbored/backend/event_processing:data_provider",
        "//tensorbored/backend/event_processing:event_multiplexer",
        "//tensorbored/compat:no_tensorflow",
        "//tensorbored/plugins:base_plugin",
        "//tensorbored/util:test_util",
        "@org_pocoo_werkzeug",
    ],
)

py_binary(
    name = "text_demo",
    srcs = ["text_demo.py"],
    srcs_version = "PY3",
    deps = [
        ":summary_v2",
        "//tensorbored:expect_absl_logging_installed",
        "//tensorbored:expect_tensorflow_installed",
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
        "//tensorbored/util:tb_logging",
    ],
)

tb_proto_library(
    name = "protos_all",
    srcs = ["plugin_data.proto"],
)
