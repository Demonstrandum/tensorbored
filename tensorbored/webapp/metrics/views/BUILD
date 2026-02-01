load("//tensorbored/defs:defs.bzl", "tf_ng_module", "tf_sass_binary", "tf_sass_library", "tf_ts_library")

package(default_visibility = ["//tensorbored:internal"])

tf_sass_library(
    name = "metrics_common_styles",
    srcs = [
        "_common.scss",
    ],
)

tf_sass_binary(
    name = "metrics_container_styles",
    src = "metrics_container.scss",
    deps = [
        "//tensorbored/webapp:angular_material_sass_deps",
        "//tensorbored/webapp/theme",
    ],
)

tf_ng_module(
    name = "views",
    srcs = [
        "metrics_container.ts",
        "metrics_views_module.ts",
    ],
    assets = [
        ":metrics_container_styles",
    ],
    deps = [
        "//tensorbored/webapp:app_state",
        "//tensorbored/webapp:selectors",
        "//tensorbored/webapp/angular:expect_angular_material_icon",
        "//tensorbored/webapp/core",
        "//tensorbored/webapp/core/store",
        "//tensorbored/webapp/customization",
        "//tensorbored/webapp/feature_flag/store",
        "//tensorbored/webapp/feature_flag/store:types",
        "//tensorbored/webapp/metrics/actions",
        "//tensorbored/webapp/metrics/views/main_view",
        "//tensorbored/webapp/metrics/views/right_pane",
        "//tensorbored/webapp/runs/views/runs_selector",
        "@npm//@angular/common",
        "@npm//@angular/core",
        "@npm//@ngrx/store",
    ],
)

tf_ts_library(
    name = "types",
    srcs = [
        "metrics_view_types.ts",
    ],
    deps = ["//tensorbored/webapp/metrics:types"],
)

tf_ts_library(
    name = "utils",
    srcs = [
        "utils.ts",
    ],
    deps = [
        ":types",
        "//tensorbored/webapp/util:types",
    ],
)

tf_ts_library(
    name = "views_test",
    testonly = True,
    srcs = [
        "metrics_container_test.ts",
        "utils_test.ts",
    ],
    deps = [
        ":types",
        ":utils",
        ":views",
        "//tensorbored/webapp:app_state",
        "//tensorbored/webapp/angular:expect_angular_core_testing",
        "//tensorbored/webapp/angular:expect_angular_platform_browser_animations",
        "//tensorbored/webapp/angular:expect_ngrx_store_testing",
        "//tensorbored/webapp/core/store",
        "//tensorbored/webapp/feature_flag/store",
        "//tensorbored/webapp/metrics/actions",
        "//tensorbored/webapp/metrics/data_source",
        "//tensorbored/webapp/metrics/views/main_view",
        "//tensorbored/webapp/runs/views/runs_selector",
        "//tensorbored/webapp/testing:utils",
        "@npm//@angular/core",
        "@npm//@angular/platform-browser",
        "@npm//@ngrx/store",
        "@npm//@types/jasmine",
    ],
)
