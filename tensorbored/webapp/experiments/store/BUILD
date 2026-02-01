load("//tensorbored/defs:defs.bzl", "tf_ts_library")

package(default_visibility = ["//tensorbored:internal"])

licenses(["notice"])

tf_ts_library(
    name = "store",
    srcs = [
        "experiments_reducers.ts",
        "index.ts",
    ],
    deps = [
        ":types",
        "//tensorbored/webapp/app_routing:types",
        "//tensorbored/webapp/experiments:types",
        "//tensorbored/webapp/types",
        "@npm//@ngrx/store",
    ],
)

tf_ts_library(
    name = "selectors",
    srcs = [
        "experiments_selectors.ts",
    ],
    deps = [
        ":types",
        "//tensorbored/webapp/app_routing/store",
        "//tensorbored/webapp/experiments:types",
        "//tensorbored/webapp/types",
        "@npm//@ngrx/store",
    ],
)

tf_ts_library(
    name = "types",
    srcs = [
        "experiments_types.ts",
    ],
    deps = [
        "//tensorbored/webapp/experiments:types",
        "//tensorbored/webapp/types",
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
        "//tensorbored/webapp/experiments:types",
    ],
)

tf_ts_library(
    name = "store_test_lib",
    testonly = True,
    srcs = [
        "experiments_selectors_test.ts",
    ],
    deps = [
        ":selectors",
        ":testing",
        ":types",
        "//tensorbored/webapp:app_state",
        "//tensorbored/webapp/app_routing:types",
        "//tensorbored/webapp/app_routing/store:testing",
        "//tensorbored/webapp/testing:utils",
        "//tensorbored/webapp/types",
        "@npm//@types/jasmine",
    ],
)
