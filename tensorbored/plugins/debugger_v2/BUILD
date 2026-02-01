# Description:
# TensorBoard Debugger V2 Plugin: A plugin for inspecting and debugging
# the internals of a TensorFlow program (e.g., graphs, functions and tensors),
# with a focus on TensorFlow 2.x.
load("@rules_python//python:py_library.bzl", "py_library")
load("@rules_python//python:py_test.bzl", "py_test")

package(default_visibility = ["//tensorbored:internal"])

licenses(["notice"])

py_library(
    name = "debug_data_multiplexer",
    srcs = ["debug_data_multiplexer.py"],
    srcs_version = "PY3",
    deps = [
        "//tensorbored:errors",
        "//tensorbored:expect_tensorflow_installed",
    ],
)

py_library(
    name = "debug_data_provider",
    srcs = ["debug_data_provider.py"],
    srcs_version = "PY3",
    deps = [
        ":debug_data_multiplexer",
        "//tensorbored/data:provider",
    ],
)

py_library(
    name = "debugger_v2_plugin",
    srcs = ["debugger_v2_plugin.py"],
    srcs_version = "PY3",
    deps = [
        ":debug_data_provider",
        "//tensorbored:errors",
        "//tensorbored:plugin_util",
        "//tensorbored/backend:http_util",
        "//tensorbored/plugins:base_plugin",
        "@org_pocoo_werkzeug",
    ],
)

py_test(
    name = "debug_data_multiplexer_test",
    size = "small",
    srcs = ["debug_data_multiplexer_test.py"],
    srcs_version = "PY3",
    deps = [
        ":debug_data_multiplexer",
        "//tensorbored:expect_tensorflow_installed",
    ],
)

py_test(
    name = "debugger_v2_plugin_test",
    size = "medium",
    srcs = ["debugger_v2_plugin_test.py"],
    srcs_version = "PY3",
    deps = [
        ":debug_data_multiplexer",
        ":debugger_v2_plugin",
        "//tensorbored:expect_tensorflow_installed",
        "//tensorbored/backend:application",
        "//tensorbored/plugins:base_plugin",
    ],
)
