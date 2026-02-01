load("//tensorbored/defs:defs.bzl", "tf_ng_module", "tf_ts_library")

package(default_visibility = ["//tensorbored:internal"])

licenses(["notice"])

tf_ng_module(
    name = "runs_selector",
    srcs = [
        "runs_selector_component.ts",
        "runs_selector_container.ts",
        "runs_selector_module.ts",
    ],
    deps = [
        "//tensorbored/webapp:app_state",
        "//tensorbored/webapp:selectors",
        "//tensorbored/webapp/runs/store:types",
        "//tensorbored/webapp/runs/views/runs_table",
        "//tensorbored/webapp/runs/views/runs_table:types",
        "@npm//@angular/common",
        "@npm//@angular/core",
        "@npm//@ngrx/store",
        "@npm//rxjs",
    ],
)

tf_ts_library(
    name = "runs_selector_test",
    testonly = True,
    srcs = [
        "runs_selector_test.ts",
    ],
    deps = [
        ":runs_selector",
        "//tensorbored/webapp:app_state",
        "//tensorbored/webapp:selectors",
        "//tensorbored/webapp/angular:expect_angular_core_testing",
        "//tensorbored/webapp/angular:expect_angular_platform_browser_animations",
        "//tensorbored/webapp/angular:expect_ngrx_store_testing",
        "//tensorbored/webapp/runs/store:testing",
        "//tensorbored/webapp/runs/views/runs_table",
        "//tensorbored/webapp/runs/views/runs_table:types",
        "//tensorbored/webapp/testing:utils",
        "@npm//@angular/core",
        "@npm//@angular/platform-browser",
        "@npm//@ngrx/store",
        "@npm//@types/jasmine",
        "@npm//rxjs",
    ],
)
