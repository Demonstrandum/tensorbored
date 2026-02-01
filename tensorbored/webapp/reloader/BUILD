load("//tensorbored/defs:defs.bzl", "tf_ng_module", "tf_ts_library")

package(default_visibility = ["//tensorbored:internal"])

tf_ng_module(
    name = "reloader",
    srcs = [
        "reloader_component.ts",
        "reloader_module.ts",
    ],
    deps = [
        "//tensorbored/webapp/core",
        "//tensorbored/webapp/core/actions",
        "//tensorbored/webapp/core/store",
        "//tensorbored/webapp/settings",
        "@npm//@angular/common",
        "@npm//@angular/core",
        "@npm//@ngrx/store",
        "@npm//rxjs",
    ],
)

tf_ts_library(
    name = "test_lib",
    testonly = True,
    srcs = [
        "reloader_component_test.ts",
    ],
    deps = [
        ":reloader",
        "//tensorbored/webapp/angular:expect_angular_core_testing",
        "//tensorbored/webapp/angular:expect_ngrx_store_testing",
        "//tensorbored/webapp/core/actions",
        "//tensorbored/webapp/settings:testing",
        "@npm//@angular/common",
        "@npm//@angular/core",
        "@npm//@angular/platform-browser",
        "@npm//@ngrx/store",
        "@npm//@types/jasmine",
    ],
)
