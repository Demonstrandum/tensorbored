load("//tensorboard/defs:defs.bzl", "tf_ng_module", "tf_ng_web_test_suite", "tf_ts_library")

package(default_visibility = ["//tensorboard:internal"])

licenses(["notice"])

tf_ts_library(
    name = "types",
    srcs = [
        "types.ts",
    ],
    deps = [
        "//tensorboard/webapp/metrics:types",
        "//tensorboard/webapp/runs:types",
    ],
)

tf_ng_module(
    name = "profile",
    srcs = [
        "index.ts",
        "profile_module.ts",
    ],
    deps = [
        ":types",
        "//tensorboard/webapp/profile/actions",
        "//tensorboard/webapp/profile/data_source",
        "//tensorboard/webapp/profile/effects",
        "//tensorboard/webapp/profile/store",
        "@npm//@angular/core",
        "@npm//@ngrx/effects",
        "@npm//@ngrx/store",
    ],
)

tf_ng_web_test_suite(
    name = "types_test",
    deps = [
        ":types_test_lib",
    ],
)

tf_ts_library(
    name = "types_test_lib",
    testonly = True,
    srcs = [
        "types_test.ts",
    ],
    deps = [
        ":types",
        "@npm//@types/jasmine",
    ],
)
