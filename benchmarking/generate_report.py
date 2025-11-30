import argparse
import json
import os

def main(exp_id):
    with open(os.path.join('experiments', exp_id, 'results.json'), 'r') as f:
        summary = json.load(f)
    # map implementationId to display label Implementation N based on first occurrence order
    order = []
    for r in summary.get('results', []):
        if r['implementationId'] not in order:
            order.append(r['implementationId'])
    def label_for(impl_id):
        try:
            idx = order.index(impl_id)
            return f"Implementation {idx+1}"
        except ValueError:
            return impl_id
    lines = []
    lines.append(f"# Experiment {exp_id}")
    lines.append(f"Class: {summary['ai']['complexityClass']}")
    lines.append(f"Recommended: {label_for(summary['ai']['recommendedImplementationId'])}")
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
