# Description:
# Event processing logic for TensorBoard
load("@rules_python//python:py_library.bzl", "py_library")
load("@rules_python//python:py_test.bzl", "py_test")

package(default_visibility = ["//tensorbored:internal"])

licenses(["notice"])

py_library(
    name = "io_wrapper",
    srcs = ["io_wrapper.py"],
    srcs_version = "PY3",
    visibility = ["//visibility:public"],
    deps = [
        "//tensorbored/compat:tensorflow",
        "//tensorbored/util:io_util",
        "//tensorbored/util:tb_logging",
    ],
)

py_test(
    name = "io_wrapper_test",
    size = "small",
    srcs = ["io_wrapper_test.py"],
    srcs_version = "PY3",
    deps = [
        ":io_wrapper",
        "//tensorbored:expect_tensorflow_installed",
    ],
)

py_library(
    name = "data_ingester",
    srcs = ["data_ingester.py"],
    srcs_version = "PY3",
    deps = [
        ":data_provider",
        ":event_multiplexer",
        ":tag_types",
        "//tensorbored/compat:tensorflow",
        "//tensorbored/data:ingester",
        "//tensorbored/plugins/audio:metadata",
        "//tensorbored/plugins/histogram:metadata",
        "//tensorbored/plugins/image:metadata",
        "//tensorbored/plugins/pr_curve:metadata",
        "//tensorbored/plugins/scalar:metadata",
        "//tensorbored/util:tb_logging",
    ],
)

py_test(
    name = "data_ingester_test",
    srcs = ["data_ingester_test.py"],
    python_version = "PY3",
    srcs_version = "PY3",
    deps = [
        ":data_ingester",
        "//tensorbored:expect_tensorflow_installed",
        "//tensorbored:test",
        "//tensorbored/compat:tensorflow",
    ],
)

py_library(
    name = "data_provider",
    srcs = ["data_provider.py"],
    srcs_version = "PY3",
    deps = [
        ":event_accumulator",
        "//tensorbored:errors",
        "//tensorbored/data:provider",
        "//tensorbored/util:tb_logging",
        "//tensorbored/util:tensor_util",
    ],
)

py_test(
    name = "data_provider_test",
    srcs = ["data_provider_test.py"],
    srcs_version = "PY3",
    deps = [
        ":data_provider",
        ":event_multiplexer",
        "//tensorbored:context",
        "//tensorbored:expect_tensorflow_installed",
        "//tensorbored/compat/proto:protos_all_py_pb2",
        "//tensorbored/data:provider",
        "//tensorbored/plugins/graph:metadata",
        "//tensorbored/plugins/histogram:metadata",
        "//tensorbored/plugins/histogram:summary_v2",
        "//tensorbored/plugins/image:metadata",
        "//tensorbored/plugins/image:summary_v2",
        "//tensorbored/plugins/scalar:metadata",
        "//tensorbored/plugins/scalar:summary_v2",
        "//tensorbored/util:tensor_util",
    ],
)

py_library(
    name = "directory_loader",
    srcs = ["directory_loader.py"],
    srcs_version = "PY3",
    deps = [
        ":directory_watcher",
        ":io_wrapper",
        "//tensorbored/compat:tensorflow",
        "//tensorbored/util:tb_logging",
    ],
)

py_test(
    name = "directory_loader_test",
    size = "small",
    srcs = ["directory_loader_test.py"],
    srcs_version = "PY3",
    deps = [
        ":directory_loader",
        ":directory_watcher",
        ":event_file_loader",
        "//tensorbored:expect_tensorflow_installed",
        "//tensorbored/util:test_util",
    ],
)

py_library(
    name = "directory_watcher",
    srcs = ["directory_watcher.py"],
    srcs_version = "PY3",
    visibility = ["//visibility:public"],
    deps = [
        ":io_wrapper",
        "//tensorbored/compat:tensorflow",
        "//tensorbored/util:io_util",
        "//tensorbored/util:tb_logging",
    ],
)

py_test(
    name = "directory_watcher_test",
    size = "small",
    srcs = ["directory_watcher_test.py"],
    srcs_version = "PY3",
    deps = [
        ":directory_watcher",
        "//tensorbored:expect_tensorflow_installed",
    ],
)

py_library(
    name = "reservoir",
    srcs = ["reservoir.py"],
    srcs_version = "PY3",
)

py_test(
    name = "reservoir_test",
    size = "small",
    srcs = ["reservoir_test.py"],
    srcs_version = "PY3",
    deps = [
        ":reservoir",
        "//tensorbored:expect_tensorflow_installed",
    ],
)

py_library(
    name = "event_file_loader",
    srcs = ["event_file_loader.py"],
    srcs_version = "PY3",
    visibility = ["//visibility:public"],
    deps = [
        "//tensorbored:data_compat",
        "//tensorbored:dataclass_compat",
        "//tensorbored/compat:tensorflow",
        "//tensorbored/compat/proto:protos_all_py_pb2",
        "//tensorbored/util:platform_util",
        "//tensorbored/util:tb_logging",
    ],
)

py_test(
    name = "event_file_loader_test",
    size = "small",
    srcs = ["event_file_loader_test.py"],
    srcs_version = "PY3",
    deps = [
        ":event_file_loader",
        "//tensorbored:expect_tensorflow_installed",
        "//tensorbored:test",
        "//tensorbored/compat",
        "//tensorbored/compat/proto:protos_all_py_pb2",
        "//tensorbored/summary/writer",
    ],
)

py_test(
    name = "event_file_loader_notf_test",
    size = "small",
    srcs = ["event_file_loader_test.py"],
    main = "event_file_loader_test.py",
    srcs_version = "PY3",
    deps = [
        ":event_file_loader",
        "//tensorbored:test",
        "//tensorbored/compat",
        "//tensorbored/compat:no_tensorflow",
        "//tensorbored/compat/proto:protos_all_py_pb2",
        "//tensorbored/summary/writer",
    ],
)

py_library(
    name = "event_util",
    srcs = ["event_util.py"],
    srcs_version = "PY3",
    visibility = ["//visibility:public"],
    deps = [
        "//tensorbored/compat/proto:protos_all_py_pb2",
        "//tensorbored/util:tb_logging",
    ],
)

py_test(
    name = "event_util_test",
    size = "small",
    srcs = ["event_util_test.py"],
    srcs_version = "PY3",
    deps = [
        ":event_util",
        "//tensorbored:test",
        "//tensorbored/compat/proto:protos_all_py_pb2",
        "//tensorbored/util:tb_logging",
    ],
)

py_library(
    name = "tag_types",
    srcs = ["tag_types.py"],
    srcs_version = "PY3",
)

py_library(
    name = "event_accumulator",
    srcs = [
        "event_accumulator.py",
        "plugin_event_accumulator.py",
    ],
    srcs_version = "PY3",
    visibility = ["//visibility:public"],
    deps = [
        ":directory_loader",
        ":directory_watcher",
        ":event_file_loader",
        ":event_util",
        ":io_wrapper",
        ":plugin_asset_util",
        ":reservoir",
        ":tag_types",
        "//tensorbored/compat/proto:protos_all_py_pb2",
        "//tensorbored/plugins/distribution:compressor",
        "//tensorbored/util:tb_logging",
    ],
)

py_test(
    name = "event_accumulator_test",
    size = "small",
    srcs = ["event_accumulator_test.py"],
    srcs_version = "PY3",
    deps = [
        ":event_accumulator",
        "//tensorbored:data_compat",
        "//tensorbored:dataclass_compat",
        "//tensorbored:expect_tensorflow_installed",
        "//tensorbored/compat/proto:protos_all_py_pb2",
        "//tensorbored/plugins/audio:metadata",
        "//tensorbored/plugins/audio:summary",
        "//tensorbored/plugins/distribution:compressor",
        "//tensorbored/plugins/image:metadata",
        "//tensorbored/plugins/image:summary",
        "//tensorbored/plugins/scalar:metadata",
        "//tensorbored/plugins/scalar:summary",
        "//tensorbored/util:tensor_util",
        "//tensorbored/util:test_util",
    ],
)

py_test(
    name = "plugin_event_accumulator_test",
    size = "small",
    srcs = ["plugin_event_accumulator_test.py"],
    srcs_version = "PY3",
    deps = [
        ":event_accumulator",
        "//tensorbored:expect_tensorflow_installed",
        "//tensorbored/compat/proto:protos_all_py_pb2",
        "//tensorbored/plugins/audio:summary",
        "//tensorbored/plugins/distribution:compressor",
        "//tensorbored/plugins/graph:metadata",
        "//tensorbored/plugins/image:summary",
        "//tensorbored/plugins/scalar:summary",
        "//tensorbored/util:tb_logging",
        "//tensorbored/util:tensor_util",
        "//tensorbored/util:test_util",
    ],
)

py_library(
    name = "event_multiplexer",
    srcs = [
        "event_multiplexer.py",
        "plugin_event_multiplexer.py",
    ],
    srcs_version = "PY3",
    visibility = ["//visibility:public"],
    deps = [
        ":directory_watcher",
        ":event_accumulator",
        ":io_wrapper",
        "//tensorbored/util:tb_logging",
    ],
)

py_test(
    name = "event_multiplexer_test",
    size = "small",
    srcs = ["event_multiplexer_test.py"],
    srcs_version = "PY3",
    deps = [
        ":event_accumulator",
        ":event_multiplexer",
        "//tensorbored:expect_numpy_installed",
        "//tensorbored:expect_tensorflow_installed",
    ],
)

py_test(
    name = "plugin_event_multiplexer_test",
    size = "small",
    srcs = ["plugin_event_multiplexer_test.py"],
    srcs_version = "PY3",
    deps = [
        ":event_accumulator",
        ":event_multiplexer",
        "//tensorbored:expect_tensorflow_installed",
        "//tensorbored/util:test_util",
    ],
)

py_library(
    name = "plugin_asset_util",
    srcs = ["plugin_asset_util.py"],
    srcs_version = "PY3",
    visibility = ["//visibility:public"],
    deps = [
        "//tensorbored/compat:tensorflow",
    ],
)

py_library(
    name = "event_file_inspector",
    srcs = ["event_file_inspector.py"],
    srcs_version = "PY3",
    visibility = ["//visibility:public"],
    deps = [
        ":event_accumulator",
        ":io_wrapper",
        "//tensorbored/compat:tensorflow",
        "//tensorbored/compat/proto:protos_all_py_pb2",
    ],
)

py_test(
    name = "event_file_inspector_test",
    size = "small",
    srcs = ["event_file_inspector_test.py"],
    srcs_version = "PY3",
    deps = [
        ":event_file_inspector",
        "//tensorbored:expect_tensorflow_installed",
        "//tensorbored/compat/proto:protos_all_py_pb2",
        "//tensorbored/util:test_util",
    ],
)
