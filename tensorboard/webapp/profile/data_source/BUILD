load("//tensorboard/defs:defs.bzl", "tf_ng_module", "tf_ng_web_test_suite", "tf_ts_library")

package(default_visibility = ["//tensorboard:internal"])

licenses(["notice"])

tf_ng_module(
    name = "data_source",
    srcs = [
        "index.ts",
        "profile_data_source.ts",
        "profile_data_source_module.ts",
    ],
    deps = [
        "//tensorboard/webapp/profile:types",
        "//tensorboard/webapp/webapp_data_source:http_client",
        "@npm//@angular/core",
        "@npm//rxjs",
    ],
)

tf_ng_web_test_suite(
    name = "data_source_test",
    deps = [
        ":data_source_test_lib",
    ],
)

tf_ts_library(
    name = "data_source_test_lib",
    testonly = True,
    srcs = [
        "profile_data_source_test.ts",
    ],
    deps = [
        ":data_source",
        "//tensorboard/webapp/angular:expect_angular_common_http_testing",
        "//tensorboard/webapp/angular:expect_angular_core_testing",
        "//tensorboard/webapp/profile:types",
        "//tensorboard/webapp/webapp_data_source:http_client",
        "@npm//@types/jasmine",
    ],
)
