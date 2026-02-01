load("//tensorbored/defs:defs.bzl", "tf_ng_module", "tf_ts_library")

package(default_visibility = ["//tensorbored:internal"])

tf_ts_library(
    name = "const",
    srcs = [
        "const.ts",
    ],
)

tf_ng_module(
    name = "http",
    srcs = [
        "feature_flag_http_interceptor.ts",
    ],
    deps = [
        ":const",
        "//tensorbored/webapp/angular:expect_angular_common_http",
        "//tensorbored/webapp/feature_flag:types",
        "//tensorbored/webapp/feature_flag/store",
        "//tensorbored/webapp/feature_flag/store:types",
        "@npm//@angular/core",
        "@npm//@ngrx/store",
        "@npm//rxjs",
    ],
)

tf_ts_library(
    name = "http_test_lib",
    testonly = True,
    srcs = [
        "feature_flag_http_interceptor_test.ts",
    ],
    deps = [
        ":const",
        ":http",
        "//tensorbored/webapp/angular:expect_angular_common_http",
        "//tensorbored/webapp/angular:expect_angular_common_http_testing",
        "//tensorbored/webapp/angular:expect_angular_core_testing",
        "//tensorbored/webapp/angular:expect_ngrx_store_testing",
        "//tensorbored/webapp/feature_flag:testing",
        "//tensorbored/webapp/feature_flag:types",
        "//tensorbored/webapp/feature_flag/store",
        "//tensorbored/webapp/feature_flag/store:types",
        "//tensorbored/webapp/testing:utils",
        "@npm//@angular/core",
        "@npm//@ngrx/effects",
        "@npm//@ngrx/store",
        "@npm//@types/jasmine",
        "@npm//rxjs",
    ],
)
