# Description:
# TensorBoard plugin for metrics (scalars, images, histograms, distributions)

load("@rules_python//python:py_library.bzl", "py_library")
load("@rules_python//python:py_test.bzl", "py_test")

package(default_visibility = ["//tensorbored:internal"])

licenses(["notice"])

py_library(
    name = "metrics_plugin",
    srcs = [
        "metadata.py",
        "metrics_plugin.py",
    ],
    srcs_version = "PY3",
    deps = [
        "//tensorbored:errors",
        "//tensorbored:plugin_util",
        "//tensorbored/backend:http_util",
        "//tensorbored/data:provider",
        "//tensorbored/plugins:base_plugin",
        "//tensorbored/plugins/histogram:metadata",
        "//tensorbored/plugins/image:metadata",
        "//tensorbored/plugins/scalar:metadata",
        "//tensorbored/util:img_mime_type_detector",
        "@org_pocoo_werkzeug",
    ],
)

py_library(
    name = "metadata",
    srcs = ["metadata.py"],
    srcs_version = "PY3",
)

py_test(
    name = "metrics_plugin_test",
    size = "medium",
    srcs = ["metrics_plugin_test.py"],
    main = "metrics_plugin_test.py",
    python_version = "PY3",
    srcs_version = "PY3",
    deps = [
        ":metrics_plugin",
        "//tensorbored:context",
        "//tensorbored:expect_tensorflow_installed",
        "//tensorbored/backend:application",
        "//tensorbored/backend/event_processing:data_provider",
        "//tensorbored/backend/event_processing:event_accumulator",
        "//tensorbored/backend/event_processing:event_multiplexer",
        "//tensorbored/data:provider",
        "//tensorbored/plugins:base_plugin",
        "//tensorbored/plugins/core:profile_writer",
        "//tensorbored/plugins/image:metadata",
        "//tensorbored/util:test_util",
        "@org_pocoo_werkzeug",
    ],
)
