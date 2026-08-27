load("@rules_python//python:py_binary.bzl", "py_binary")
load("@rules_python//python:py_library.bzl", "py_library")
load("@rules_python//python:py_test.bzl", "py_test")
load("//tensorbored/defs:protos.bzl", "tb_proto_library")

package(default_visibility = ["//tensorbored:internal"])

licenses(["notice"])

# Public-facing API, included in Pip package.
py_library(
    name = "mesh",
    srcs = ["__init__.py"],
    visibility = ["//visibility:public"],
    deps = [
        ":summary",
    ],
)

py_library(
    name = "metadata",
    srcs = ["metadata.py"],
    deps = [
        ":protos_all_py_pb2",
        "//tensorbored/compat/proto:protos_all_py_pb2",
    ],
)

py_test(
    name = "metadata_test",
    size = "small",
    srcs = ["metadata_test.py"],
    deps = [
        ":metadata",
        "//tensorbored:expect_tensorflow_installed",
    ],
)

py_library(
    name = "mesh_plugin",
    srcs = ["mesh_plugin.py"],
    deps = [
        ":metadata",
        ":protos_all_py_pb2",
        "//tensorbored:expect_numpy_installed",
        "//tensorbored:plugin_util",
        "//tensorbored/backend:http_util",
        "//tensorbored/data:provider",
        "//tensorbored/plugins:base_plugin",
        "@tensorboard_pip_deps//werkzeug",
    ],
)

py_library(
    name = "test_utils",
    testonly = 1,
    srcs = ["test_utils.py"],
    deps = [
        ":summary",
        "//tensorbored/backend/event_processing:event_multiplexer",
        "@tensorboard_pip_deps//werkzeug",
    ],
)

py_test(
    name = "mesh_plugin_test",
    size = "small",
    srcs = ["mesh_plugin_test.py"],
    deps = [
        ":mesh_plugin",
        ":summary",
        ":test_utils",
        "//tensorbored:expect_numpy_installed",
        "//tensorbored:expect_tensorflow_installed",
        "//tensorbored/backend:application",
        "//tensorbored/backend/event_processing:data_provider",
        "//tensorbored/backend/event_processing:event_multiplexer",
        "//tensorbored/plugins:base_plugin",
        "//tensorbored/util:test_util",
        "@tensorboard_pip_deps//werkzeug",
    ],
)

py_library(
    name = "summary",
    srcs = ["summary.py"],
    visibility = [
        "//visibility:public",
    ],
    deps = [
        ":metadata",
        ":protos_all_py_pb2",
        ":summary_v2",
        "//tensorbored:expect_tensorflow_installed",
    ],
)

py_library(
    name = "summary_v2",
    srcs = ["summary_v2.py"],
    deps = [
        ":metadata",
        "//tensorbored/compat",
        "//tensorbored/compat:tensorflow",
        "//tensorbored/compat/proto:protos_all_py_pb2",
        "//tensorbored/util:tensor_util",
    ],
)

py_test(
    name = "summary_test",
    size = "small",
    srcs = ["summary_test.py"],
    deps = [
        ":summary",
        ":test_utils",
        "//tensorbored:expect_tensorflow_installed",
    ],
)

py_test(
    name = "summary_v2_test",
    size = "small",
    srcs = ["summary_v2_test.py"],
    deps = [
        ":metadata",
        ":protos_all_py_pb2",
        ":summary",
        ":test_utils",
        "//tensorbored:expect_tensorflow_installed",
    ],
)

tb_proto_library(
    name = "protos_all",
    srcs = ["plugin_data.proto"],
)

py_library(
    name = "demo_utils",
    srcs = ["demo_utils.py"],
    deps = [
        "//tensorbored:expect_numpy_installed",
        "//tensorbored:expect_tensorflow_installed",
        "//tensorbored/compat",
        "//tensorbored/compat:tensorflow",
    ],
)

py_test(
    name = "demo_utils_test",
    size = "small",
    srcs = ["demo_utils_test.py"],
    data = [
        ":test_data",
    ],
    deps = [
        ":demo_utils",
        "//tensorbored/compat:tensorflow",
    ],
)

py_binary(
    name = "mesh_demo",
    srcs = ["mesh_demo.py"],
    data = [
        ":test_data",
    ],
    deps = [
        ":demo_utils",
        ":summary_v2",
        "//tensorbored:expect_absl_app_installed",
        "//tensorbored:expect_absl_flags_installed",
        "//tensorbored:expect_numpy_installed",
        "//tensorbored:expect_tensorflow_installed",
    ],
)

filegroup(
    name = "test_data",
    srcs = [
        "test_data/icosphere.ply",
    ],
)
