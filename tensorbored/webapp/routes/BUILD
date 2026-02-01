load("//tensorbored/defs:defs.bzl", "tf_ts_library")

package(default_visibility = ["//tensorbored:internal"])

licenses(["notice"])

tf_ts_library(
    name = "routes",
    srcs = [
        "index.ts",
    ],
    deps = [
        ":dashboard_deeplink_provider",
        "//tensorbored/webapp/app_routing:route_config",
        "//tensorbored/webapp/app_routing:types",
        "//tensorbored/webapp/tb_wrapper",
        "@npm//@angular/core",
    ],
)

tf_ts_library(
    name = "dashboard_deeplink_provider_types",
    srcs = [
        "dashboard_deeplink_provider_types.ts",
    ],
    deps = [
        "//tensorbored/webapp/core:types",
        "//tensorbored/webapp/metrics:types",
        "//tensorbored/webapp/runs:types",
    ],
)

tf_ts_library(
    name = "dashboard_deeplink_provider",
    srcs = [
        "dashboard_deeplink_provider.ts",
    ],
    deps = [
        ":dashboard_deeplink_provider_types",
        ":feature_flag_serializer",
        "//tensorbored/webapp:app_state",
        "//tensorbored/webapp:selectors",
        "//tensorbored/webapp/app_routing:deep_link_provider",
        "//tensorbored/webapp/app_routing:route_config",
        "//tensorbored/webapp/app_routing:types",
        "//tensorbored/webapp/feature_flag/store",
        "//tensorbored/webapp/metrics:types",
        "//tensorbored/webapp/metrics/data_source:types",
        "//tensorbored/webapp/runs:types",
        "//tensorbored/webapp/tb_wrapper",
        "@npm//@angular/core",
        "@npm//@ngrx/store",
        "@npm//rxjs",
    ],
)

tf_ts_library(
    name = "feature_flag_serializer",
    srcs = [
        "feature_flag_serializer.ts",
    ],
    deps = [
        "//tensorbored/webapp/app_routing:types",
        "//tensorbored/webapp/feature_flag:types",
        "//tensorbored/webapp/feature_flag/store:feature_flag_metadata",
    ],
)

tf_ts_library(
    name = "testing",
    testonly = True,
    srcs = [
        "testing.ts",
    ],
    deps = [
        ":dashboard_deeplink_provider_types",
    ],
)

tf_ts_library(
    name = "routes_test_lib",
    testonly = True,
    srcs = [
        "dashboard_deeplink_provider_test.ts",
        "feature_flag_serializer_test.ts",
    ],
    deps = [
        ":dashboard_deeplink_provider",
        ":feature_flag_serializer",
        ":testing",
        "//tensorbored/webapp:app_state",
        "//tensorbored/webapp:selectors",
        "//tensorbored/webapp/angular:expect_angular_core_testing",
        "//tensorbored/webapp/angular:expect_ngrx_store_testing",
        "//tensorbored/webapp/app_routing:deep_link_provider",
        "//tensorbored/webapp/app_routing:location",
        "//tensorbored/webapp/app_routing:types",
        "//tensorbored/webapp/feature_flag/store:feature_flag_metadata",
        "//tensorbored/webapp/feature_flag/store:testing",
        "//tensorbored/webapp/metrics:test_lib",
        "//tensorbored/webapp/metrics:types",
        "//tensorbored/webapp/metrics/data_source:types",
        "//tensorbored/webapp/runs:types",
        "//tensorbored/webapp/testing:utils",
        "@npm//@angular/core",
        "@npm//@ngrx/store",
        "@npm//@types/jasmine",
        "@npm//rxjs",
    ],
)
