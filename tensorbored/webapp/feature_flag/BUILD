load("//tensorbored/defs:defs.bzl", "tf_ng_module", "tf_ng_web_test_suite", "tf_ts_library")

package(default_visibility = ["//tensorbored:internal"])

tf_ng_module(
    name = "feature_flag",
    srcs = [
        "feature_flag_module.ts",
    ],
    deps = [
        "//tensorbored/webapp/angular:expect_angular_common_http",
        "//tensorbored/webapp/feature_flag/effects",
        "//tensorbored/webapp/feature_flag/http",
        "//tensorbored/webapp/feature_flag/store",
        "//tensorbored/webapp/feature_flag/store:types",
        "//tensorbored/webapp/persistent_settings",
        "//tensorbored/webapp/webapp_data_source:feature_flag",
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
)

tf_ts_library(
    name = "testing",
    testonly = True,
    srcs = [
        "testing.ts",
    ],
    deps = [
        ":types",
        "//tensorbored/webapp/feature_flag/store:feature_flag_metadata",
    ],
)

tf_ng_web_test_suite(
    name = "karma_test",
    deps = [
        "//tensorbored/webapp/feature_flag/directives:directives_test_lib",
        "//tensorbored/webapp/feature_flag/effects:effects_test_lib",
        "//tensorbored/webapp/feature_flag/http:http_test_lib",
        "//tensorbored/webapp/feature_flag/store:store_test_lib",
        "//tensorbored/webapp/feature_flag/views:views_test_lib",
    ],
)
