load("//tensorbored/defs:defs.bzl", "tf_ng_web_test_suite", "tf_ts_library")

package(default_visibility = ["//tensorbored:internal"])

licenses(["notice"])

tf_ts_library(
    name = "store",
    srcs = [
        "index.ts",
        "profile_reducers.ts",
        "profile_selectors.ts",
        "profile_types.ts",
    ],
    deps = [
        "//tensorbored/webapp/profile:types",
        "//tensorbored/webapp/profile/actions",
        "//tensorbored/webapp/types",
        "@npm//@ngrx/store",
    ],
)

tf_ng_web_test_suite(
    name = "store_test",
    deps = [
        ":store_test_lib",
    ],
)

tf_ts_library(
    name = "store_test_lib",
    testonly = True,
    srcs = [
        "profile_reducers_test.ts",
    ],
    deps = [
        ":store",
        "//tensorbored/webapp/profile:types",
        "//tensorbored/webapp/profile/actions",
        "//tensorbored/webapp/types",
        "@npm//@types/jasmine",
    ],
)
