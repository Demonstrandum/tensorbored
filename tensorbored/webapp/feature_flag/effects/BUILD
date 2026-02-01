load("//tensorbored/defs:defs.bzl", "tf_ng_module")

package(default_visibility = ["//tensorbored:internal"])

tf_ng_module(
    name = "effects",
    srcs = [
        "feature_flag_effects.ts",
    ],
    deps = [
        "//tensorbored/webapp:tb_polymer_interop_types",
        "//tensorbored/webapp/feature_flag:types",
        "//tensorbored/webapp/feature_flag/actions",
        "//tensorbored/webapp/feature_flag/store",
        "//tensorbored/webapp/feature_flag/store:types",
        "//tensorbored/webapp/webapp_data_source:feature_flag",
        "//tensorbored/webapp/webapp_data_source:feature_flag_types",
        "@npm//@angular/core",
        "@npm//@ngrx/effects",
        "@npm//@ngrx/store",
        "@npm//rxjs",
    ],
)

tf_ng_module(
    name = "effects_test_lib",
    testonly = True,
    srcs = [
        "feature_flag_effects_test.ts",
    ],
    deps = [
        ":effects",
        "//tensorbored/webapp/angular:expect_angular_core_testing",
        "//tensorbored/webapp/angular:expect_ngrx_store_testing",
        "//tensorbored/webapp/feature_flag:testing",
        "//tensorbored/webapp/feature_flag:types",
        "//tensorbored/webapp/feature_flag/actions",
        "//tensorbored/webapp/feature_flag/store",
        "//tensorbored/webapp/feature_flag/store:feature_flag_metadata",
        "//tensorbored/webapp/feature_flag/store:types",
        "//tensorbored/webapp/testing:utils",
        "//tensorbored/webapp/webapp_data_source:feature_flag_testing",
        "@npm//@ngrx/effects",
        "@npm//@ngrx/store",
        "@npm//@types/jasmine",
        "@npm//rxjs",
    ],
)
