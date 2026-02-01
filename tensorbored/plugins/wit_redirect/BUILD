# Description:
# Plugin with installation instructions for dynamic interpretability plugin
load("@rules_python//python:py_library.bzl", "py_library")
load("@rules_python//python:py_test.bzl", "py_test")

package(default_visibility = ["//tensorbored:internal"])

licenses(["notice"])

py_library(
    name = "wit_redirect_plugin",
    srcs = ["wit_redirect_plugin.py"],
    srcs_version = "PY3",
    deps = [
        "//tensorbored/plugins:base_plugin",
    ],
)

py_test(
    name = "wit_redirect_plugin_test",
    srcs = ["wit_redirect_plugin_test.py"],
    srcs_version = "PY3",
    deps = [
        ":wit_redirect_plugin",
        "//tensorbored:test",
        "//tensorbored/plugins:base_plugin",
    ],
)
