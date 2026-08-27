# Description:
# TensorBoard plugin for distributions
load("@rules_python//python:py_library.bzl", "py_library")
load("@rules_python//python:py_test.bzl", "py_test")

package(default_visibility = ["//tensorbored:internal"])

licenses(["notice"])

## Distributions Plugin ##
py_library(
    name = "distributions_plugin",
    srcs = ["distributions_plugin.py"],
    deps = [
        ":compressor",
        ":metadata",
        "//tensorbored:plugin_util",
        "//tensorbored/backend:http_util",
        "//tensorbored/plugins:base_plugin",
        "//tensorbored/plugins/histogram:histograms_plugin",
        "@tensorboard_pip_deps//werkzeug",
    ],
)

py_test(
    name = "distributions_plugin_test",
    size = "small",
    srcs = ["distributions_plugin_test.py"],
    main = "distributions_plugin_test.py",
    deps = [
        ":compressor",
        ":distributions_plugin",
        "//tensorbored:context",
        "//tensorbored:errors",
        "//tensorbored:expect_tensorflow_installed",
        "//tensorbored/backend/event_processing:data_provider",
        "//tensorbored/backend/event_processing:event_multiplexer",
        "//tensorbored/backend/event_processing:tag_types",
        "//tensorbored/plugins:base_plugin",
        "//tensorbored/plugins/histogram:summary",
        "//tensorbored/util:test_util",
        "@tensorboard_pip_deps//werkzeug",
    ],
)

# TODO(#2007): Remove this after pruning unnecessary TensorFlow deps in main test
py_test(
    name = "distributions_plugin_notf_test",
    size = "small",
    srcs = ["distributions_plugin_test.py"],
    main = "distributions_plugin_test.py",
    deps = [
        ":compressor",
        ":distributions_plugin",
        "//tensorbored:context",
        "//tensorbored:errors",
        "//tensorbored:expect_tensorflow_installed",
        "//tensorbored/backend/event_processing:data_provider",
        "//tensorbored/backend/event_processing:event_multiplexer",
        "//tensorbored/backend/event_processing:tag_types",
        "//tensorbored/compat:no_tensorflow",
        "//tensorbored/plugins:base_plugin",
        "//tensorbored/plugins/histogram:summary",
        "//tensorbored/util:test_util",
        "@tensorboard_pip_deps//werkzeug",
    ],
)

py_library(
    name = "compressor",
    srcs = ["compressor.py"],
    deps = ["//tensorbored:expect_numpy_installed"],
)

py_test(
    name = "compressor_test",
    size = "small",
    srcs = ["compressor_test.py"],
    deps = [
        ":compressor",
        "//tensorbored:expect_tensorflow_installed",
    ],
)

py_library(
    name = "metadata",
    srcs = ["metadata.py"],
)
