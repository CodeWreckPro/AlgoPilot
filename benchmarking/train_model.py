import argparse
import json
import os
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import OneHotEncoder
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType

def load_results(exp_id):
    with open(os.path.join('experiments', exp_id, 'raw_results.json'), 'r') as f:
        return json.load(f)

def complexity_label(sizes, runtimes):
    x = np.log(np.array(sizes))
    y = np.log(np.array(runtimes) + 1e-9)
    coef = np.polyfit(x, y, 1)[0]
    if coef < 0.8:
        return 'O(n)'
    elif coef < 1.2:
        return 'O(n log n)'
    elif coef < 2.0:
        return 'O(n^2)'
    else:
        return 'O(n^k)'

def train(exp_id):
    raw = load_results(exp_id)
    data = raw['results']
    sizes = np.array([d['size'] for d in data]).reshape(-1, 1)
    runtime = np.array([d['runtimeMs'] for d in data])
    memory = np.array([d['memoryBytes'] for d in data])
    lr_runtime = LinearRegression().fit(sizes, runtime)
    lr_memory = LinearRegression().fit(sizes, memory)
    pred_sizes = sizes.flatten().tolist()

    # pick recommended by lowest runtime at largest size
    largest = max([d['size'] for d in data])
    by_impl = {}
    for d in data:
        if d['size'] == largest:
            by_impl.setdefault(d['implementationId'], []).append(d['runtimeMs'])
    recommended = min(by_impl.items(), key=lambda kv: np.mean(kv[1]))[0] if by_impl else data[0]['implementationId']

    summary = {
        'experimentId': exp_id,
        'results': data,
        'ai': {
            'complexityClass': complexity_label(pred_sizes, runtime.tolist()),
            'predicted': [{'size': int(s), 'runtimeMs': float(lr_runtime.predict([[s]])[0]), 'memoryBytes': float(lr_memory.predict([[s]])[0])} for s in sorted(set(pred_sizes))],
            'recommendedImplementationId': recommended,
            'justification': 'Based on linear fit and runtime at largest size.'
        }
    }
    with open(os.path.join('experiments', exp_id, 'results.json'), 'w') as f:
        json.dump(summary, f)
    initial_type = [('X', FloatTensorType([None, 1]))]
    onnx_runtime = convert_sklearn(lr_runtime, initial_types=initial_type, target_opset=12)
    onnx_memory = convert_sklearn(lr_memory, initial_types=initial_type, target_opset=12)
    out_dir = os.path.join('experiments', exp_id, 'ml')
    os.makedirs(out_dir, exist_ok=True)
    with open(os.path.join(out_dir, 'model.onnx'), 'wb') as f:
        f.write(onnx_runtime.SerializeToString())
    with open(os.path.join(out_dir, 'memory.onnx'), 'wb') as f:
        f.write(onnx_memory.SerializeToString())

if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--experiment-id', required=True)
    args = ap.parse_args()
    train(args.experiment_id)
