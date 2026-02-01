load("//tensorbored/defs:defs.bzl", "tf_ng_module", "tf_ts_library")

package(default_visibility = ["//tensorbored:internal"])

tf_ng_module(
    name = "store",
    srcs = [
        "feature_flag_reducers.ts",
        "feature_flag_selectors.ts",
        "feature_flag_store_config_provider.ts",
    ],
    deps = [
        ":feature_flag_metadata",
        ":types",
        "//tensorbored/webapp/feature_flag:types",
        "//tensorbored/webapp/feature_flag/actions",
        "//tensorbored/webapp/persistent_settings",
        "//tensorbored/webapp/webapp_data_source:feature_flag",
        "@npm//@angular/core",
        "@npm//@ngrx/store",
        "@npm//rxjs",
    ],
)

tf_ng_module(
    name = "feature_flag_metadata",
    srcs = [
        "feature_flag_metadata.ts",
    ],
    deps = [
        "//tensorbored/webapp/feature_flag:types",
        "@npm//@angular/core",
    ],
)

tf_ng_module(
    name = "types",
    srcs = [
        "feature_flag_types.ts",
    ],
    deps = [
        ":feature_flag_metadata",
        "//tensorbored/webapp/feature_flag:types",
    ],
)

tf_ts_library(
    name = "testing",
    testonly = True,
    srcs = ["testing.ts"],
    deps = [
        ":feature_flag_metadata",
        ":types",
        "//tensorbored/webapp/feature_flag:testing",
    ],
)

tf_ng_module(
    name = "store_test_lib",
    testonly = True,
    srcs = [
        "feature_flag_metadata_test.ts",
        "feature_flag_reducers_test.ts",
        "feature_flag_selectors_test.ts",
    ],
    deps = [
        ":feature_flag_metadata",
        ":store",
        ":testing",
        ":types",
        "//tensorbored/webapp/feature_flag:testing",
        "//tensorbored/webapp/feature_flag:types",
        "//tensorbored/webapp/feature_flag/actions",
        "//tensorbored/webapp/persistent_settings",
        "@npm//@ngrx/store",
        "@npm//@types/jasmine",
    ],
)
