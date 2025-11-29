import argparse
import json
import os

def main(exp_id):
    with open(os.path.join('experiments', exp_id, 'results.json'), 'r') as f:
        summary = json.load(f)
    lines = []
    lines.append(f"# Experiment {exp_id}")
    lines.append(f"Class: {summary['ai']['complexityClass']}")
    lines.append(f"Recommended: {summary['ai']['recommendedImplementationId']}")
    lines.append("Predictions:")
    for p in summary['ai']['predicted']:
        lines.append(f"- size {p['size']} runtime {p['runtimeMs']:.2f} ms memory {p['memoryBytes']:.0f} B")
    with open(os.path.join('experiments', exp_id, 'report.md'), 'w') as f:
        f.write("\n".join(lines))

if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--experiment-id', required=True)
    args = ap.parse_args()
    main(args.experiment_id)
