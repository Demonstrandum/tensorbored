# Description:
# TensorBoard plugin for custom scalars plots
load("@rules_python//python:py_binary.bzl", "py_binary")
load("@rules_python//python:py_library.bzl", "py_library")
load("@rules_python//python:py_test.bzl", "py_test")
load("//tensorbored/defs:protos.bzl", "tb_proto_library")

package(default_visibility = ["//tensorbored:internal"])

licenses(["notice"])

## Custom Scalars Plugin ##
py_library(
    name = "custom_scalars_plugin",
    srcs = ["custom_scalars_plugin.py"],
    srcs_version = "PY3",
    deps = [
        ":metadata",
        ":protos_all_py_pb2",
        "//tensorbored:expect_protobuf_installed",
        "//tensorbored:plugin_util",
        "//tensorbored/backend:http_util",
        "//tensorbored/compat:tensorflow",
        "//tensorbored/plugins:base_plugin",
        "//tensorbored/plugins/scalar:metadata",
        "//tensorbored/plugins/scalar:scalars_plugin",
        "@org_pocoo_werkzeug",
    ],
)

py_library(
    name = "metadata",
    srcs = ["metadata.py"],
    srcs_version = "PY3",
    visibility = ["//visibility:public"],
    deps = [
        "//tensorbored/compat/proto:protos_all_py_pb2",
    ],
)

py_library(
    name = "summary",
    srcs = ["summary.py"],
    srcs_version = "PY3",
    deps = [
        ":metadata",
        ":protos_all_py_pb2",
        "//tensorbored:expect_tensorflow_installed",
    ],
)

py_test(
    name = "summary_test",
    size = "small",
    srcs = ["summary_test.py"],
    srcs_version = "PY3",
    deps = [
        ":metadata",
        ":protos_all_py_pb2",
        ":summary",
        "//tensorbored:expect_tensorflow_installed",
        "//tensorbored/backend/event_processing:event_multiplexer",
        "//tensorbored/util:tensor_util",
        "//tensorbored/util:test_util",
    ],
)

py_test(
    name = "custom_scalars_plugin_test",
    size = "small",
    srcs = ["custom_scalars_plugin_test.py"],
    srcs_version = "PY3",
    deps = [
        ":custom_scalars_plugin",
        ":protos_all_py_pb2",
        ":summary",
        "//tensorbored:context",
        "//tensorbored:expect_numpy_installed",
        "//tensorbored:expect_protobuf_installed",
        "//tensorbored:expect_tensorflow_installed",
        "//tensorbored/backend:application",
        "//tensorbored/backend/event_processing:data_provider",
        "//tensorbored/backend/event_processing:event_multiplexer",
        "//tensorbored/plugins:base_plugin",
        "//tensorbored/plugins/scalar:scalars_plugin",
        "//tensorbored/plugins/scalar:summary",
        "//tensorbored/util:test_util",
        "@org_pocoo_werkzeug",
    ],
)

# TODO(#2007): Remove this after pruning unnecessary TensorFlow deps in main test
py_test(
    name = "custom_scalars_plugin_notf_test",
    size = "small",
    srcs = ["custom_scalars_plugin_test.py"],
    main = "custom_scalars_plugin_test.py",
    srcs_version = "PY3",
    deps = [
        ":custom_scalars_plugin",
        ":protos_all_py_pb2",
        ":summary",
        "//tensorbored:context",
        "//tensorbored:expect_numpy_installed",
        "//tensorbored:expect_protobuf_installed",
        "//tensorbored:expect_tensorflow_installed",
        "//tensorbored/backend:application",
        "//tensorbored/backend/event_processing:data_provider",
        "//tensorbored/backend/event_processing:event_multiplexer",
        "//tensorbored/compat:no_tensorflow",
        "//tensorbored/plugins:base_plugin",
        "//tensorbored/plugins/scalar:scalars_plugin",
        "//tensorbored/plugins/scalar:summary",
        "//tensorbored/util:test_util",
        "@org_pocoo_werkzeug",
    ],
)

tb_proto_library(
    name = "protos_all",
    srcs = ["layout.proto"],
    visibility = ["//visibility:public"],
)

py_binary(
    name = "custom_scalar_demo",
    srcs = ["custom_scalar_demo.py"],
    srcs_version = "PY3",
    deps = [
        ":protos_all_py_pb2",
        "//tensorbored:expect_tensorflow_installed",
        "//tensorbored/summary:summary_v1",
    ],
)
