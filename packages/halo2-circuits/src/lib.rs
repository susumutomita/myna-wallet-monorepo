use halo2_base::{
    gates::{
        circuit::{builder::BaseCircuitBuilder, BaseConfig, CircuitBuilderStage},
        flex_gate::MultiPhaseThreadBreakPoints,
    },
    halo2_proofs::{
        circuit::{Layouter, SimpleFloorPlanner},
        halo2curves::bn256::{Bn256, Fr},
        plonk::{self, Circuit, ConstraintSystem, Selector},
        poly::kzg::commitment::ParamsKZG,
    },
};
use itertools::Itertools;
use snark_verifier_sdk::{
    halo2::aggregation::{AggregationCircuit, AggregationConfigParams, VerifierUniversality},
    CircuitExt, Snark, SHPLONK,
};
use wasm_bindgen::prelude::*;
pub mod helpers;
#[wasm_bindgen]
extern "C" {
    pub fn alert(s: &str);
}
