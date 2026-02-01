load("//tensorbored/defs:defs.bzl", "tf_ng_module", "tf_ts_library")

package(default_visibility = ["//tensorbored:internal"])

tf_ng_module(
    name = "effects",
    srcs = [
        "core_effects.ts",
        "index.ts",
    ],
    deps = [
        "//tensorbored/webapp:app_state",
        "//tensorbored/webapp:tb_polymer_interop_types",
        "//tensorbored/webapp/app_routing",
        "//tensorbored/webapp/app_routing:types",
        "//tensorbored/webapp/app_routing/actions",
        "//tensorbored/webapp/app_routing/store",
        "//tensorbored/webapp/app_routing/store:types",
        "//tensorbored/webapp/core:state",
        "//tensorbored/webapp/core:types",
        "//tensorbored/webapp/core/actions",
        "//tensorbored/webapp/core/store",
        "//tensorbored/webapp/feature_flag/store",
        "//tensorbored/webapp/types",
        "//tensorbored/webapp/webapp_data_source",
        "@npm//@angular/common",
        "@npm//@angular/core",
        "@npm//@ngrx/effects",
        "@npm//@ngrx/store",
        "@npm//rxjs",
    ],
)

tf_ts_library(
    name = "core_effects_test_lib",
    testonly = True,
    srcs = [
        "core_effects_test.ts",
    ],
    deps = [
        ":effects",
        "//tensorbored/webapp:app_state",
        "//tensorbored/webapp/angular:expect_angular_core_testing",
        "//tensorbored/webapp/angular:expect_ngrx_store_testing",
        "//tensorbored/webapp/app_routing:testing",
        "//tensorbored/webapp/app_routing:types",
        "//tensorbored/webapp/app_routing/actions",
        "//tensorbored/webapp/app_routing/store",
        "//tensorbored/webapp/core:types",
        "//tensorbored/webapp/core/actions",
        "//tensorbored/webapp/core/store",
        "//tensorbored/webapp/core/testing",
        "//tensorbored/webapp/feature_flag/store",
        "//tensorbored/webapp/types",
        "//tensorbored/webapp/webapp_data_source",
        "//tensorbored/webapp/webapp_data_source:http_client_testing",
        "@npm//@angular/common",
        "@npm//@angular/core",
        "@npm//@ngrx/effects",
        "@npm//@ngrx/store",
        "@npm//@types/jasmine",
        "@npm//rxjs",
    ],
)
