load("//tensorbored/defs:defs.bzl", "tf_ng_module", "tf_ts_library")

package(default_visibility = ["//tensorbored:internal"])

tf_ng_module(
    name = "custom_modal",
    srcs = [
        "custom_modal.ts",
    ],
    deps = [
        "//tensorbored/webapp/angular:expect_angular_cdk_overlay",
        "//tensorbored/webapp/angular:expect_angular_cdk_portal",
        "//tensorbored/webapp/util:dom",
        "@npm//@angular/core",
        "@npm//rxjs",
    ],
)

tf_ts_library(
    name = "custom_modal_test",
    testonly = True,
    srcs = [
        "custom_modal_test.ts",
    ],
    deps = [
        ":custom_modal",
        "//tensorbored/webapp/angular:expect_angular_cdk_overlay",
        "//tensorbored/webapp/angular:expect_angular_core_testing",
        "@npm//@angular/common",
        "@npm//@angular/core",
        "@npm//@angular/platform-browser",
        "@npm//@types/jasmine",
        "@npm//rxjs",
    ],
)
