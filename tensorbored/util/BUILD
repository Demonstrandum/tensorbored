load("//tensorbored/defs:protos.bzl", "tb_proto_library")
load("@rules_python//python:py_library.bzl", "py_library")
load("@rules_python//python:py_test.bzl", "py_test")

package(default_visibility = ["//tensorbored:internal"])

licenses(["notice"])

py_library(
    name = "encoder",
    srcs = ["encoder.py"],
    srcs_version = "PY3",
    deps = [
        ":op_evaluator",
        "//tensorbored:expect_numpy_installed",
        "//tensorbored:expect_tensorflow_installed",
    ],
)

py_test(
    name = "encoder_test",
    size = "small",
    srcs = ["encoder_test.py"],
    srcs_version = "PY3",
    deps = [
        ":encoder",
        "//tensorbored:expect_numpy_installed",
        "//tensorbored:expect_tensorflow_installed",
    ],
)

py_library(
    name = "grpc_util",
    srcs = ["grpc_util.py"],
    srcs_version = "PY3",
    deps = [
        "//tensorbored:expect_grpc_installed",
        "//tensorbored:version",
        "//tensorbored/util:tb_logging",
    ],
)

py_test(
    name = "grpc_util_test",
    size = "small",
    srcs = ["grpc_util_test.py"],
    srcs_version = "PY3",
    deps = [
        ":grpc_util",
        ":grpc_util_test_proto_py_pb2",
        ":grpc_util_test_proto_py_pb2_grpc",
        ":test_util",
        "//tensorbored:expect_grpc_installed",
        "//tensorbored:test",
        "//tensorbored:version",
    ],
)

tb_proto_library(
    name = "grpc_util_test_proto",
    testonly = True,
    srcs = ["grpc_util_test.proto"],
    has_services = True,
)

py_library(
    name = "lazy_tensor_creator",
    srcs = ["lazy_tensor_creator.py"],
    srcs_version = "PY3",
    deps = [
        "//tensorbored/compat",
    ],
)

py_test(
    name = "lazy_tensor_creator_test",
    size = "small",
    srcs = ["lazy_tensor_creator_test.py"],
    srcs_version = "PY3",
    deps = [
        ":lazy_tensor_creator",
        "//tensorbored:expect_tensorflow_installed",
    ],
)

py_library(
    name = "op_evaluator",
    srcs = ["op_evaluator.py"],
    srcs_version = "PY3",
    deps = [
        "//tensorbored:expect_tensorflow_installed",
    ],
)

py_test(
    name = "op_evaluator_test",
    size = "small",
    srcs = ["op_evaluator_test.py"],
    srcs_version = "PY3",
    deps = [
        ":op_evaluator",
        "//tensorbored:expect_tensorflow_installed",
    ],
)

py_library(
    name = "img_mime_type_detector",
    srcs = ["img_mime_type_detector.py"],
    deps = [
        "//tensorbored:expect_pillow_installed",
    ],
)

py_library(
    name = "io_util",
    srcs = ["io_util.py"],
    srcs_version = "PY3",
)

py_test(
    name = "io_util_test",
    size = "small",
    srcs = ["io_util_test.py"],
    srcs_version = "PY3",
    tags = ["support_notf"],
    deps = [
        ":io_util",
        "//tensorbored:test",
    ],
)

py_library(
    name = "platform_util",
    srcs = ["platform_util.py"],
    srcs_version = "PY3",
)

py_test(
    name = "platform_util_test",
    size = "small",
    srcs = ["platform_util_test.py"],
    srcs_version = "PY3",
    tags = ["support_notf"],
    deps = [
        ":platform_util",
        "//tensorbored:test",
    ],
)

py_library(
    name = "tb_logging",
    srcs = ["tb_logging.py"],
    srcs_version = "PY3",
)

py_library(
    name = "tensor_util",
    srcs = ["tensor_util.py"],
    srcs_version = "PY3",
    deps = [
        "//tensorbored/compat/proto:protos_all_py_pb2",
        "//tensorbored/compat/tensorflow_stub",
    ],
)

py_library(
    name = "test_util",
    testonly = 1,
    srcs = ["test_util.py"],
    srcs_version = "PY3",
    deps = [
        ":tb_logging",
        "//tensorbored:expect_absl_logging_installed",
        "//tensorbored:expect_tensorflow_installed",
        "//tensorbored/compat/proto:protos_all_py_pb2",
    ],
)

py_library(
    name = "timing",
    srcs = ["timing.py"],
    srcs_version = "PY3",
    deps = [
        ":tb_logging",
    ],
)

py_test(
    name = "timing_test",
    size = "small",
    srcs = ["timing_test.py"],
    srcs_version = "PY3",
    deps = [
        ":tb_logging",
        ":timing",
        "//tensorbored:test",
    ],
)
