load("//tensorbored/defs:defs.bzl", "tf_ng_module")

package(default_visibility = ["//tensorbored:internal"])

tf_ng_module(
    name = "deeplink",
    srcs = [
        "deeplink_module.ts",
        "hash.ts",
        "index.ts",
        "types.ts",
    ],
    deps = [
        "//tensorbored/webapp:tb_polymer_interop_types",
        "@npm//@angular/core",
    ],
)

tf_ng_module(
    name = "deeplink_test_lib",
    testonly = True,
    srcs = [
        "deeplink_test.ts",
    ],
    deps = [
        ":deeplink",
        "//tensorbored/webapp:tb_polymer_interop_types",
        "//tensorbored/webapp/angular:expect_angular_core_testing",
        "@npm//@types/jasmine",
    ],
)

tf_ng_module(
    name = "testing",
    srcs = [
        "testing.ts",
    ],
    deps = [
        ":deeplink",
        "@npm//@angular/core",
    ],
)
