load("//tensorbored/defs:defs.bzl", "tf_ng_web_test_suite", "tf_ts_library")

package(default_visibility = ["//tensorbored:internal"])

licenses(["notice"])

tf_ts_library(
    name = "tf_feature_flags",
    srcs = [
        "feature-flags.ts",
        "tf-feature-flags-polymer.ts",
    ],
    deps = [
        "//tensorbored/webapp/feature_flag:types",
        "@npm//@polymer/decorators",
        "@npm//@polymer/polymer",
    ],
)

tf_ts_library(
    name = "test_lib",
    testonly = True,
    srcs = [
        "feature-flags-test.ts",
    ],
    deps = [
        ":tf_feature_flags",
        "//tensorbored/webapp/feature_flag:testing",
        "@npm//@types/jasmine",
    ],
)

tf_ng_web_test_suite(
    name = "karma_test",
    deps = [
        ":test_lib",
    ],
)
