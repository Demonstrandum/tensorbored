load("//tensorbored/defs:defs.bzl", "tf_ng_module", "tf_ts_library")

package(default_visibility = ["//tensorbored:internal"])

licenses(["notice"])

tf_ng_module(
    name = "metrics",
    srcs = [
        "metrics_module.ts",
    ],
    deps = [
        "//tensorbored/webapp/alert:alert_action",
        "//tensorbored/webapp/app_routing",
        "//tensorbored/webapp/core",
        "//tensorbored/webapp/feature_flag",
        "//tensorbored/webapp/metrics/actions",
        "//tensorbored/webapp/metrics/data_source",
        "//tensorbored/webapp/metrics/effects",
        "//tensorbored/webapp/metrics/store",
        "//tensorbored/webapp/metrics/store:metrics_initial_state_provider",
        "//tensorbored/webapp/metrics/views",
        "//tensorbored/webapp/persistent_settings",
        "//tensorbored/webapp/plugins:plugin_registry",
        "@npm//@angular/common",
        "@npm//@angular/core",
        "@npm//@ngrx/effects",
        "@npm//@ngrx/store",
    ],
)

tf_ts_library(
    name = "types",
    srcs = [
        "types.ts",
    ],
    deps = [
        ":internal_types",
    ],
)

tf_ts_library(
    name = "internal_types",
    srcs = [
        "internal_types.ts",
    ],
    visibility = ["//tensorbored/webapp/metrics:__subpackages__"],
    deps = [
        "//tensorbored/webapp/widgets/card_fob:types",
        "//tensorbored/webapp/widgets/data_table:types",
        "//tensorbored/webapp/widgets/histogram:types",
    ],
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
    name = "utils_test",
    testonly = True,
    srcs = [
        "utils_test.ts",
    ],
    deps = [
        ":utils",
        "//tensorbored/webapp/metrics/data_source",
        "//tensorbored/webapp/metrics/views:types",
        "@npm//@types/jasmine",
    ],
)

tf_ts_library(
    name = "test_lib",
    testonly = True,
    srcs = [
        "testing.ts",
    ],
    deps = [
        ":internal_types",
        ":types",
        "//tensorbored/webapp:app_state",
        "//tensorbored/webapp/metrics/data_source",
        "//tensorbored/webapp/metrics/store",
        "//tensorbored/webapp/metrics/store:types",
        "//tensorbored/webapp/types",
        "//tensorbored/webapp/widgets/data_table:types",
        "//tensorbored/webapp/widgets/histogram:types",
        "//tensorbored/webapp/widgets/line_chart_v2/lib:internal_types",
        "@npm//@angular/core",
        "@npm//@types/jasmine",
        "@npm//rxjs",
    ],
)

tf_ts_library(
    name = "integration_test",
    testonly = True,
    srcs = [
        "metrics_integration_test.ts",
    ],
    deps = [
        ":metrics",
        "//tensorbored/webapp:app_state",
        "//tensorbored/webapp/angular:expect_angular_core_testing",
        "//tensorbored/webapp/angular:expect_angular_platform_browser_animations",
        "//tensorbored/webapp/angular:expect_angular_platform_browser_dynamic_testing",
        "//tensorbored/webapp/feature_flag",
        "//tensorbored/webapp/metrics/store:metrics_initial_state_provider",
        "//tensorbored/webapp/metrics/store:types",
        "//tensorbored/webapp/metrics/views",
        "//tensorbored/webapp/testing:integration_test_module",
        "//tensorbored/webapp/testing:utils",
        "@npm//@angular/platform-browser",
        "@npm//@ngrx/store",
        "@npm//@types/jasmine",
    ],
)
