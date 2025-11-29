import json
import sys
import numpy as np

def generate(sizes, distributions):
    data = {}
    for size in sizes:
        arr = np.arange(size)
        for d in distributions:
            if d == 'random':
                x = np.random.permutation(arr).tolist()
            elif d == 'sorted':
                x = arr.tolist()
            elif d == 'reverse':
                x = arr[::-1].tolist()
            else:
                x = arr.tolist()
            data[f'{size}:{d}'] = x
    return data

if __name__ == '__main__':
    config_path = sys.argv[1]
    with open(config_path, 'r') as f:
        cfg = json.load(f)
    sizes = cfg['inputProfile']['sizes']
    dists = cfg['inputProfile']['distributions']
    ds = generate(sizes, dists)
    print(json.dumps(ds))
