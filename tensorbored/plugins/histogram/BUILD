# Description:
# TensorBoard plugin for histograms

load("//tensorbored/defs:protos.bzl", "tb_proto_library")
load("@rules_python//python:py_binary.bzl", "py_binary")
load("@rules_python//python:py_library.bzl", "py_library")
load("@rules_python//python:py_test.bzl", "py_test")

package(default_visibility = ["//tensorbored:internal"])

licenses(["notice"])

## Histograms Plugin ##
py_library(
    name = "histograms_plugin",
    srcs = ["histograms_plugin.py"],
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
    name = "histograms_plugin_test",
    size = "medium",
    srcs = ["histograms_plugin_test.py"],
    main = "histograms_plugin_test.py",
    srcs_version = "PY3",
    deps = [
        ":histograms_plugin",
        ":summary",
        "//tensorbored:context",
        "//tensorbored:errors",
        "//tensorbored:expect_tensorflow_installed",
        "//tensorbored/backend/event_processing:data_provider",
        "//tensorbored/backend/event_processing:event_multiplexer",
        "//tensorbored/backend/event_processing:tag_types",
        "//tensorbored/data:provider",
        "//tensorbored/plugins:base_plugin",
        "//tensorbored/util:test_util",
        "@org_pocoo_werkzeug",
    ],
)

# TODO(#2007): Remove this after pruning unnecessary TensorFlow deps in main test
py_test(
    name = "histograms_plugin_notf_test",
    size = "small",
    srcs = ["histograms_plugin_test.py"],
    main = "histograms_plugin_test.py",
    srcs_version = "PY3",
    deps = [
        ":histograms_plugin",
        ":summary",
        "//tensorbored:context",
        "//tensorbored:errors",
        "//tensorbored:expect_tensorflow_installed",
        "//tensorbored/backend/event_processing:data_provider",
        "//tensorbored/backend/event_processing:event_multiplexer",
        "//tensorbored/backend/event_processing:tag_types",
        "//tensorbored/compat:no_tensorflow",
        "//tensorbored/data:provider",
        "//tensorbored/plugins:base_plugin",
        "//tensorbored/util:test_util",
        "@org_pocoo_werkzeug",
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
        "//tensorbored:expect_numpy_installed",
        "//tensorbored/compat",
        "//tensorbored/compat/proto:protos_all_py_pb2",
        "//tensorbored/util:lazy_tensor_creator",
        "//tensorbored/util:tensor_util",
    ],
)

py_test(
    name = "summary_test",
    # `test_with_large_counts` will be skipped.
    size = "small",
    srcs = ["summary_test.py"],
    main = "summary_test.py",
    srcs_version = "PY3",
    deps = [
        ":summary",
        "//tensorbored:expect_tensorflow_installed",
        "//tensorbored/compat/proto:protos_all_py_pb2",
        "//tensorbored/util:tensor_util",
    ],
)

py_test(
    name = "large_count_summary_test",
    # Ensure enough RAM for `test_with_large_counts`.
    size = "large",
    srcs = ["summary_test.py"],
    args = [
        "-- -k",
        "test_with_large_counts",
    ],
    main = "summary_test.py",
    srcs_version = "PY3",
    deps = [
        ":summary",
        "//tensorbored:expect_tensorflow_installed",
        "//tensorbored/compat/proto:protos_all_py_pb2",
        "//tensorbored/util:tensor_util",
    ],
)

py_binary(
    name = "histograms_demo",
    srcs = ["histograms_demo.py"],
    srcs_version = "PY3",
    deps = [
        ":summary",
        "//tensorbored:expect_tensorflow_installed",
    ],
)

tb_proto_library(
    name = "protos_all",
    srcs = ["plugin_data.proto"],
)
