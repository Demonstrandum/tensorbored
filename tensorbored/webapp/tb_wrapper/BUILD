load("//tensorbored/defs:defs.bzl", "tf_ng_module")

package(default_visibility = ["//tensorbored:internal"])

licenses(["notice"])

tf_ng_module(
    name = "tb_wrapper",
    srcs = [
        "tb_wrapper_component.ts",
        "tb_wrapper_module.ts",
    ],
    deps = [
        "//tensorbored/webapp/plugins",
        "//tensorbored/webapp/reloader",
        "@npm//@angular/common",
        "@npm//@angular/core",
    ],
)
