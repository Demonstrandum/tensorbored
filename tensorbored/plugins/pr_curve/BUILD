# Description:
# TensorBoard plugin for precision-recall curves.

load("//tensorbored/defs:protos.bzl", "tb_proto_library")
load("@rules_python//python:py_binary.bzl", "py_binary")
load("@rules_python//python:py_library.bzl", "py_library")
load("@rules_python//python:py_test.bzl", "py_test")

package(default_visibility = ["//tensorbored:internal"])

licenses(["notice"])

py_library(
    name = "metadata",
    srcs = ["metadata.py"],
    srcs_version = "PY3",
    deps = [
        ":protos_all_py_pb2",
        "//tensorbored/compat/proto:protos_all_py_pb2",
    ],
)

py_library(
    name = "pr_curves_plugin",
    srcs = ["pr_curves_plugin.py"],
    srcs_version = "PY3",
    visibility = ["//visibility:public"],
    deps = [
        ":metadata",
        "//tensorbored:expect_numpy_installed",
        "//tensorbored:plugin_util",
        "//tensorbored/backend:http_util",
        "//tensorbored/data:provider",
        "//tensorbored/plugins:base_plugin",
        "@org_pocoo_werkzeug",
    ],
)

py_test(
    name = "pr_curves_plugin_test",
    size = "medium",  # tf integration test
    srcs = ["pr_curves_plugin_test.py"],
    srcs_version = "PY3",
    deps = [
        ":metadata",
        ":pr_curve_demo_lib",
        ":pr_curves_plugin",
        "//tensorbored:context",
        "//tensorbored:expect_numpy_installed",
        "//tensorbored:expect_tensorflow_installed",
        "//tensorbored/backend/event_processing:data_provider",
        "//tensorbored/backend/event_processing:event_multiplexer",
        "//tensorbored/plugins:base_plugin",
        "@org_pocoo_werkzeug",
    ],
)

# TODO(#2007): Remove this after pruning unnecessary TensorFlow deps in main test
py_test(
    name = "pr_curves_plugin_notf_test",
    size = "medium",  # tf integration test
    srcs = ["pr_curves_plugin_test.py"],
    main = "pr_curves_plugin_test.py",
    srcs_version = "PY3",
    deps = [
        ":metadata",
        ":pr_curve_demo_lib",
        ":pr_curves_plugin",
        "//tensorbored:context",
        "//tensorbored:expect_numpy_installed",
        "//tensorbored:expect_tensorflow_installed",
        "//tensorbored/backend/event_processing:data_provider",
        "//tensorbored/backend/event_processing:event_multiplexer",
        "//tensorbored/compat:no_tensorflow",
        "//tensorbored/plugins:base_plugin",
        "@org_pocoo_werkzeug",
    ],
)

py_library(
    name = "summary",
    srcs = ["summary.py"],
    srcs_version = "PY3",
    visibility = ["//visibility:public"],
    deps = [
        ":metadata",
        "//tensorbored:expect_numpy_installed",
        "//tensorbored:expect_tensorflow_installed",
        "//tensorbored/util:tensor_util",
    ],
)

py_test(
    name = "summary_test",
    size = "small",
    srcs = ["summary_test.py"],
    srcs_version = "PY3",
    deps = [
        ":summary",
        "//tensorbored:expect_numpy_installed",
        "//tensorbored:expect_tensorflow_installed",
        "//tensorbored/compat/proto:protos_all_py_pb2",
        "//tensorbored/plugins:base_plugin",
        "//tensorbored/util:test_util",
        "@org_pocoo_werkzeug",
    ],
)

tb_proto_library(
    name = "protos_all",
    srcs = ["plugin_data.proto"],
    visibility = ["//visibility:public"],
)

py_binary(
    name = "pr_curve_demo",
    srcs = ["pr_curve_demo.py"],
    srcs_version = "PY3",
    deps = [":pr_curve_demo_lib"],
)

py_library(
    name = "pr_curve_demo_lib",
    srcs = ["pr_curve_demo.py"],
    srcs_version = "PY3",
    deps = [
        ":summary",
        "//tensorbored:expect_tensorflow_installed",
    ],
)
