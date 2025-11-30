import argparse
import json
import os
import subprocess
import sys
import time
import tempfile
import psutil

def read_config(exp_id):
    path = os.path.join('experiments', exp_id, 'config.json')
    with open(path, 'r') as f:
        return json.load(f)

def run_python(code, input_data):
    fd, tmp = tempfile.mkstemp(suffix='.py')
    os.close(fd)
    with open(tmp, 'w') as f:
        f.write(code + "\n")
        f.write("import json\n")
        f.write("def __run(x):\n    return run_algorithm(x)\n")
        f.write("print(json.dumps(__run(json.loads(open('__in.json').read()))))\n")
    with open('__in.json', 'w') as f:
        f.write(json.dumps(input_data))
    p = psutil.Process()
    mem_before = p.memory_info().rss
    t0 = time.perf_counter()
    out = subprocess.run([sys.executable, tmp], capture_output=True, text=True, timeout=60)
    dt = (time.perf_counter() - t0) * 1000.0
    mem_after = p.memory_info().rss
    os.remove(tmp)
    os.remove('__in.json')
    return dt, max(mem_after - mem_before, 0), None

def run_ts(code, input_data):
    fd, tmp = tempfile.mkstemp(suffix='.ts')
    os.close(fd)
    with open(tmp, 'w') as f:
        f.write(code + "\n")
        f.write("import fs from 'fs'\n")
        f.write("function __run(x:any){return runAlgorithm(x)}\n")
        f.write("const x = JSON.parse(fs.readFileSync('__in.json','utf-8'))\n")
        f.write("console.log(JSON.stringify(__run(x)))\n")
    with open('__in.json', 'w') as f:
        f.write(json.dumps(input_data))
    p = psutil.Process()
    mem_before = p.memory_info().rss
    t0 = time.perf_counter()
    out = subprocess.run(['ts-node', tmp], capture_output=True, text=True, timeout=60)
    dt = (time.perf_counter() - t0) * 1000.0
    mem_after = p.memory_info().rss
    os.remove(tmp)
    os.remove('__in.json')
    return dt, max(mem_after - mem_before, 0), None

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--experiment-id', required=True)
    args = ap.parse_args()
    cfg = read_config(args.experiment_id)
    ds_json = subprocess.run([sys.executable, 'benchmarking/generate_datasets.py', f'experiments/{args.experiment_id}/config.json'], capture_output=True, text=True)
    datasets = json.loads(ds_json.stdout)
    results = []
    for impl in cfg['implementations']:
        for key, arr in datasets.items():
            size, dist = key.split(':')
            if impl['language'] == 'python':
                rt, mem, _ = run_python(impl['code'], arr)
            else:
                rt, mem, _ = run_ts(impl['code'], arr)
            results.append({'implementationId': impl['id'], 'size': int(size), 'distribution': dist, 'runtimeMs': rt, 'memoryBytes': mem})
    raw_path = os.path.join('experiments', args.experiment_id, 'raw_results.json')
    with open(raw_path, 'w') as f:
        json.dump({'experimentId': args.experiment_id, 'results': results}, f)
    subprocess.run([sys.executable, 'benchmarking/train_model.py', '--experiment-id', args.experiment_id], check=True)
    subprocess.run([sys.executable, 'benchmarking/generate_report.py', '--experiment-id', args.experiment_id], check=True)
    

if __name__ == '__main__':
    main()
