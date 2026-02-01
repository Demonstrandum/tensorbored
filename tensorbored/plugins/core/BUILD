# Description:
#   TensorBoard core plugin.
load("@rules_python//python:py_library.bzl", "py_library")
load("@rules_python//python:py_test.bzl", "py_test")

package(default_visibility = ["//tensorbored:internal"])

licenses(["notice"])

py_library(
    name = "core_plugin",
    srcs = ["core_plugin.py"],
    srcs_version = "PY3",
    deps = [
        "//tensorbored:plugin_util",
        "//tensorbored:version",
        "//tensorbored/backend:http_util",
        "//tensorbored/plugins:base_plugin",
        "//tensorbored/util:grpc_util",
        "//tensorbored/util:tb_logging",
        "@org_pocoo_werkzeug",
    ],
)

py_library(
    name = "profile_writer",
    srcs = ["profile_writer.py"],
    srcs_version = "PY3",
    visibility = ["//visibility:public"],
)

py_library(
    name = "color_sampler",
    srcs = ["color_sampler.py"],
    srcs_version = "PY3",
    visibility = ["//visibility:public"],
)

py_test(
    name = "core_plugin_test",
    size = "small",
    srcs = ["core_plugin_test.py"],
    srcs_version = "PY3",
    deps = [
        ":core_plugin",
        "//tensorbored:expect_tensorflow_installed",
        "//tensorbored/backend:application",
        "//tensorbored/backend/event_processing:data_provider",
        "//tensorbored/backend/event_processing:event_multiplexer",
        "//tensorbored/data:provider",
        "//tensorbored/plugins:base_plugin",
        "//tensorbored/util:test_util",
        "@org_pocoo_werkzeug",
    ],
)

py_test(
    name = "profile_writer_test",
    size = "small",
    srcs = ["profile_writer_test.py"],
    srcs_version = "PY3",
    deps = [
        ":profile_writer",
    ],
)

py_test(
    name = "color_sampler_test",
    size = "small",
    srcs = ["color_sampler_test.py"],
    srcs_version = "PY3",
    deps = [
        ":color_sampler",
    ],
)
