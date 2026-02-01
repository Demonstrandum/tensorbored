load("//tensorbored/defs:defs.bzl", "tf_ng_module", "tf_ts_library")

package(default_visibility = ["//tensorbored:internal"])

tf_ng_module(
    name = "legacy_runs_selector",
    srcs = [
        "legacy_runs_selector_component.ts",
        "legacy_runs_selector_container.ts",
        "legacy_runs_selector_module.ts",
    ],
    deps = [
        "//tensorbored/webapp:app_state",
        "//tensorbored/webapp/core/actions",
        "@npm//@angular/core",
        "@npm//@ngrx/store",
    ],
)

tf_ts_library(
    name = "test_lib",
    testonly = True,
    srcs = [
        "legacy_runs_selector_test.ts",
    ],
    deps = [
        ":legacy_runs_selector",
        "//tensorbored/webapp:app_state",
        "//tensorbored/webapp/angular:expect_angular_core_testing",
        "//tensorbored/webapp/angular:expect_angular_platform_browser_animations",
        "//tensorbored/webapp/angular:expect_ngrx_store_testing",
        "//tensorbored/webapp/core/actions",
        "//tensorbored/webapp/core/testing",
        "@npm//@angular/common",
        "@npm//@angular/core",
        "@npm//@angular/platform-browser",
        "@npm//@ngrx/store",
        "@npm//@types/jasmine",
    ],
)
