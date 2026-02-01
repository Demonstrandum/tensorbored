load("//tensorbored/defs:defs.bzl", "tf_ts_library")

package(default_visibility = ["//tensorbored:internal"])

# A standalone target providing clients a way to notify TensorBoard developers
# when events occur for debugging purposes.
tf_ts_library(
    name = "tb_debug",
    srcs = [
        "index.ts",
        "types.ts",
    ],
)
