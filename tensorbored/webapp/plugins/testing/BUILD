load("//tensorbored/defs:defs.bzl", "tf_ng_module")

package(default_visibility = ["//tensorbored:internal"])

licenses(["notice"])

tf_ng_module(
    name = "testing",
    testonly = True,
    srcs = [
        "index.ts",
    ],
    deps = [
        "//tensorbored/webapp/plugins:plugin_registry",
        "@npm//@angular/common",
        "@npm//@angular/core",
    ],
)
