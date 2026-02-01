# Description:
# Plugin with installation instructions for dynamic profile plugin

load("@rules_python//python:py_library.bzl", "py_library")
load("@rules_python//python:py_test.bzl", "py_test")

package(default_visibility = ["//tensorbored:internal"])

licenses(["notice"])

py_library(
    name = "profile_redirect_plugin",
    srcs = ["profile_redirect_plugin.py"],
    srcs_version = "PY3",
    deps = [
        "//tensorbored/plugins:base_plugin",
    ],
)

py_test(
    name = "profile_redirect_plugin_test",
    srcs = ["profile_redirect_plugin_test.py"],
    srcs_version = "PY3",
    deps = [
        ":profile_redirect_plugin",
        "//tensorbored:test",
        "//tensorbored/plugins:base_plugin",
    ],
)
