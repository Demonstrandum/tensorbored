# Description:
# TensorBoard plugin for graphs
load("@rules_python//python:py_binary.bzl", "py_binary")
load("@rules_python//python:py_library.bzl", "py_library")
load("@rules_python//python:py_test.bzl", "py_test")

package(default_visibility = ["//tensorbored:internal"])

licenses(["notice"])

## Graphs Plugin ##
py_library(
    name = "graphs_plugin",
    srcs = ["graphs_plugin.py"],
    srcs_version = "PY3",
    deps = [
        ":graph_util",
        ":keras_util",
        ":metadata",
        "//tensorbored:errors",
        "//tensorbored:expect_protobuf_installed",
        "//tensorbored:plugin_util",
        "//tensorbored/backend:http_util",
        "//tensorbored/backend:process_graph",
        "//tensorbored/data:provider",
        "//tensorbored/plugins:base_plugin",
        "@org_pocoo_werkzeug",
    ],
)

py_test(
    name = "graphs_plugin_test",
    size = "small",
    srcs = ["graphs_plugin_test.py"],
    srcs_version = "PY3",
    deps = [
        ":graphs_plugin_test_lib",
        "//tensorbored:expect_protobuf_installed",
    ],
)

py_library(
    name = "graphs_plugin_test_lib",
    testonly = True,
    srcs = ["graphs_plugin_test.py"],
    srcs_version = "PY3",
    deps = [
        ":graphs_plugin",
        "//tensorbored:context",
        "//tensorbored:expect_protobuf_installed",
        "//tensorbored:expect_tensorflow_installed",
        "//tensorbored/backend/event_processing:data_provider",
        "//tensorbored/backend/event_processing:event_multiplexer",
        "//tensorbored/compat/proto:protos_all_py_pb2",
        "//tensorbored/plugins:base_plugin",
        "//tensorbored/util:test_util",
        "@org_pocoo_werkzeug",
    ],
)

py_test(
    name = "graphs_plugin_v2_test",
    size = "small",
    srcs = ["graphs_plugin_v2_test.py"],
    main = "graphs_plugin_v2_test.py",
    srcs_version = "PY3",
    deps = [
        ":graphs_plugin",
        ":graphs_plugin_test_lib",
        "//tensorbored:errors",
        "//tensorbored:expect_numpy_installed",
        "//tensorbored:expect_protobuf_installed",
        "//tensorbored:expect_tensorflow_installed",
        "//tensorbored/compat/proto:protos_all_py_pb2",
    ],
)

# TODO(#2007): Remove this after pruning unnecessary TensorFlow deps in main test
py_test(
    name = "graphs_plugin_notf_test",
    size = "small",
    srcs = ["graphs_plugin_test.py"],
    main = "graphs_plugin_test.py",
    srcs_version = "PY3",
    deps = [
        ":graphs_plugin",
        "//tensorbored:expect_protobuf_installed",
        "//tensorbored:expect_tensorflow_installed",
        "//tensorbored/backend/event_processing:data_provider",
        "//tensorbored/backend/event_processing:event_multiplexer",
        "//tensorbored/compat:no_tensorflow",
        "//tensorbored/compat/proto:protos_all_py_pb2",
        "//tensorbored/plugins:base_plugin",
        "//tensorbored/util:test_util",
        "@org_pocoo_werkzeug",
    ],
)

py_binary(
    name = "graphs_demo",
    srcs = ["graphs_demo.py"],
    srcs_version = "PY3",
    deps = [
        "//tensorbored:expect_numpy_installed",
        "//tensorbored:expect_tensorflow_installed",
    ],
)

py_library(
    name = "keras_util",
    srcs = ["keras_util.py"],
    srcs_version = "PY3",
    visibility = ["//visibility:private"],
    deps = [
        "//tensorbored/compat/proto:protos_all_py_pb2",
        "//tensorbored/compat/tensorflow_stub",
        "//tensorbored/util:tb_logging",
    ],
)

py_test(
    name = "keras_util_test",
    size = "small",
    srcs = ["keras_util_test.py"],
    main = "keras_util_test.py",
    srcs_version = "PY3",
    deps = [
        ":keras_util",
        "//tensorbored:expect_protobuf_installed",
        "//tensorbored:expect_tensorflow_installed",
        "//tensorbored/compat/proto:protos_all_py_pb2",
    ],
)

py_library(
    name = "graph_util",
    srcs = ["graph_util.py"],
    srcs_version = "PY3",
    visibility = ["//visibility:private"],
    deps = [
        "//tensorbored/compat/proto:protos_all_py_pb2",
    ],
)

py_test(
    name = "graph_util_test",
    size = "small",
    srcs = ["graph_util_test.py"],
    main = "graph_util_test.py",
    srcs_version = "PY3",
    deps = [
        ":graph_util",
        "//tensorbored:expect_protobuf_installed",
        "//tensorbored:expect_tensorflow_installed",
        "//tensorbored/compat/proto:protos_all_py_pb2",
    ],
)

py_library(
    name = "metadata",
    srcs = ["metadata.py"],
    srcs_version = "PY3",
)

# This test suite is disabled as lodash does not seem to get properly bundled
# into the test after upgrade to spec_bundle(). Further investigation is
# required.
# TODO: Reenable or decide to delete the tests.
# tf_ng_web_test_suite(
#     name = "karma_test",
#     deps = [
#         "//tensorbored/plugins/graph/tf_graph_common:test_lib",
#     ],
# )
