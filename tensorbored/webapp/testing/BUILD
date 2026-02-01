load("//tensorbored/defs:defs.bzl", "tf_ng_module", "tf_ts_library")

package(
    default_testonly = True,
    default_visibility = ["//tensorbored:internal"],
)

licenses(["notice"])

tf_ts_library(
    name = "initialize_testbed",
    srcs = [
        "initialize_testbed.ts",
    ],
    deps = [
        "//tensorbored/webapp/angular:expect_angular_core_testing",
        "//tensorbored/webapp/angular:expect_angular_platform_browser_dynamic_testing",
        "@npm//@angular/localize",
    ],
)

tf_ng_module(
    name = "mat_icon",
    srcs = [
        "mat_icon_module.ts",
    ],
    deps = [
        "//tensorbored/webapp/angular:expect_angular_material_icon",
        "//tensorbored/webapp/angular:expect_angular_material_icon_testing",
        "@npm//@angular/core",
    ],
)

tf_ng_module(
    name = "dom",
    srcs = [
        "dom.ts",
    ],
    deps = [
        "//tensorbored/webapp/angular:expect_angular_core_testing",
        "@npm//@angular/core",
    ],
)

tf_ts_library(
    name = "lang",
    srcs = [
        "lang.ts",
    ],
)

tf_ng_module(
    name = "material",
    srcs = [
        "material.ts",
    ],
    deps = [
        "//tensorbored/webapp/angular:expect_angular_cdk_overlay",
        "@npm//@angular/core",
    ],
)

tf_ts_library(
    name = "utils",
    srcs = [
        "utils.ts",
    ],
    deps = [
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/store:types",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/testing",
        "//tensorbored/webapp:app_state",
        "//tensorbored/webapp/alert/store:testing",
        "//tensorbored/webapp/alert/store:types",
        "//tensorbored/webapp/angular:expect_ngrx_store_testing",
        "//tensorbored/webapp/app_routing/store:testing",
        "//tensorbored/webapp/app_routing/store:types",
        "//tensorbored/webapp/core/store",
        "//tensorbored/webapp/core/testing",
        "//tensorbored/webapp/experiments/store:testing",
        "//tensorbored/webapp/experiments/store:types",
        "//tensorbored/webapp/feature_flag/store:testing",
        "//tensorbored/webapp/feature_flag/store:types",
        "//tensorbored/webapp/hparams/_redux:testing",
        "//tensorbored/webapp/hparams/_redux:types",
        "//tensorbored/webapp/metrics:test_lib",
        "//tensorbored/webapp/metrics/store:types",
        "//tensorbored/webapp/notification_center/_redux:testing",
        "//tensorbored/webapp/notification_center/_redux:types",
        "//tensorbored/webapp/persistent_settings/_redux:testing",
        "//tensorbored/webapp/persistent_settings/_redux:types",
        "//tensorbored/webapp/runs/store:testing",
        "//tensorbored/webapp/runs/store:types",
        "//tensorbored/webapp/settings:testing",
        "//tensorbored/webapp/settings/_redux",
        "//tensorbored/webapp/util:types",
        "@npm//@ngrx/store",
    ],
)

tf_ng_module(
    name = "integration_test_module",
    srcs = [
        "integration_test_module.ts",
    ],
    deps = [
        ":mat_icon",
        "//tensorbored/webapp:reducer_config",
        "//tensorbored/webapp/angular:expect_angular_core_testing",
        "//tensorbored/webapp/angular:expect_angular_platform_browser_animations",
        "//tensorbored/webapp/angular:expect_angular_platform_browser_dynamic_testing",
        "//tensorbored/webapp/app_routing",
        "//tensorbored/webapp/app_routing:route_config",
        "//tensorbored/webapp/app_routing:route_registry",
        "//tensorbored/webapp/app_routing:types",
        "//tensorbored/webapp/core",
        "//tensorbored/webapp/deeplink:testing",
        "//tensorbored/webapp/feature_flag",
        "//tensorbored/webapp/runs",
        "@npm//@angular/core",
        "@npm//@ngrx/effects",
        "@npm//@ngrx/store",
    ],
)
