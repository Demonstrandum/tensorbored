load("//tensorbored/defs:defs.bzl", "tf_ts_library")

package(default_visibility = ["//tensorbored:internal"])

licenses(["notice"])

tf_ts_library(
    name = "tf_storage",
    srcs = [
        "index.ts",
        "storage.ts",
        "tf-storage-polymer.ts",
    ],
    strict_checks = False,
    deps = [
        ":tf_storage_lib",
        "//tensorbored/webapp:tb_polymer_interop_types",
        "@npm//@polymer/decorators",
        "@npm//@polymer/polymer",
        "@npm//@types/lodash",
        "@npm//lodash",
    ],
)

tf_ts_library(
    name = "tf_storage_lib",
    srcs = [
        "listeners.ts",
        "storage_utils.ts",
    ],
    strict_checks = False,
    deps = [
        "//tensorbored/components/tf_globals:tf_globals_lib",
    ],
)
