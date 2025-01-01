from typing import Dict, List, Optional, Any, Tuple
import numpy as np
from scipy import stats
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.cluster import DBSCAN
from sklearn.ensemble import IsolationForest
from statsmodels.tsa.seasonal import seasonal_decompose
from statsmodels.tsa.stattools import adfuller, grangercausalitytests
import networkx as nx
from datetime import datetime, timedelta

class IntegrationAnalytics:
    def __init__(self):
        self.scaler = StandardScaler()
        self.pca = PCA(n_components=2)
        self.dbscan = DBSCAN(eps=0.3, min_samples=5)
        self.isolation_forest = IsolationForest(random_state=42)

    def analyze_cross_component_patterns(
        self,
        data: Dict[str, np.ndarray],
        timestamps: List[datetime]
    ) -> List[Dict[str, Any]]:
        """Analyze patterns across multiple components."""
        patterns = []
        
        # Normalize data
        normalized_data = {
            component: self.scaler.fit_transform(values.reshape(-1, 1))
            for component, values in data.items()
        }
        
        # Detect trends
        trends = self._detect_trends(normalized_data, timestamps)
        patterns.extend(trends)
        
        # Detect seasonality
        seasonal_patterns = self._detect_seasonality(normalized_data, timestamps)
        patterns.extend(seasonal_patterns)
        
        # Detect clusters
        clusters = self._detect_clusters(normalized_data)
        patterns.extend(clusters)
        
        # Detect anomalies
        anomalies = self._detect_anomalies(normalized_data)
        patterns.extend(anomalies)
        
        return patterns

    def analyze_component_correlations(
        self,
        data: Dict[str, np.ndarray]
    ) -> List[Dict[str, Any]]:
        """Analyze correlations between components."""
        correlations = []
        components = list(data.keys())
        
        for i, comp1 in enumerate(components):
            for j, comp2 in enumerate(components):
                if i < j:
                    # Calculate Pearson correlation
                    pearson_corr = stats.pearsonr(data[comp1], data[comp2])
                    
                    # Calculate Spearman correlation
                    spearman_corr = stats.spearmanr(data[comp1], data[comp2])
                    
                    # Calculate cross-correlation
                    cross_corr = np.correlate(data[comp1], data[comp2], mode='full')
                    
                    # Perform Granger causality test
                    granger_result = self._granger_causality(data[comp1], data[comp2])
                    
                    correlations.append({
                        'component1': comp1,
                        'component2': comp2,
                        'pearson': {
                            'coefficient': float(pearson_corr[0]),
                            'p_value': float(pearson_corr[1])
                        },
                        'spearman': {
                            'coefficient': float(spearman_corr[0]),
                            'p_value': float(spearman_corr[1])
                        },
                        'cross_correlation': {
                            'max_lag': int(np.argmax(cross_corr) - len(data[comp1]) + 1),
                            'max_value': float(np.max(cross_corr))
                        },
                        'granger_causality': granger_result
                    })
        
        return correlations

    def analyze_component_interactions(
        self,
        data: Dict[str, np.ndarray],
        interactions: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Analyze component interactions and their network structure."""
        # Create interaction graph
        G = nx.DiGraph()
        
        # Add nodes and edges
        for interaction in interactions:
            source = interaction['source']
            target = interaction['target']
            strength = interaction['strength']
            
            G.add_edge(source, target, weight=strength)
        
        # Calculate network metrics
        analysis = {
            'centrality': {
                'degree': nx.degree_centrality(G),
                'betweenness': nx.betweenness_centrality(G),
                'eigenvector': nx.eigenvector_centrality(G, max_iter=1000)
            },
            'communities': list(nx.community.greedy_modularity_communities(G.to_undirected())),
            'strongest_paths': dict(nx.all_pairs_dijkstra_path(G, weight='weight')),
            'component_influence': self._calculate_component_influence(G)
        }
        
        return analysis

    def _detect_trends(
        self,
        data: Dict[str, np.ndarray],
        timestamps: List[datetime]
    ) -> List[Dict[str, Any]]:
        """Detect trends in component data."""
        trends = []
        
        for component, values in data.items():
            # Fit linear trend
            x = np.arange(len(values))
            slope, intercept, r_value, p_value, std_err = stats.linregress(x, values)
            
            if abs(slope) > 0.1 and p_value < 0.05:  # Significant trend
                trends.append({
                    'type': 'trend',
                    'component': component,
                    'slope': float(slope),
                    'r_squared': float(r_value ** 2),
                    'p_value': float(p_value),
                    'confidence': float(1 - p_value),
                    'direction': 'increasing' if slope > 0 else 'decreasing'
                })
        
        return trends

    def _detect_seasonality(
        self,
        data: Dict[str, np.ndarray],
        timestamps: List[datetime]
    ) -> List[Dict[str, Any]]:
        """Detect seasonal patterns in component data."""
        seasonal_patterns = []
        
        for component, values in data.items():
            try:
                # Perform seasonal decomposition
                result = seasonal_decompose(
                    values,
                    period=self._estimate_period(values)
                )
                
                # Calculate seasonality strength
                seasonality_strength = np.std(result.seasonal) / np.std(values)
                
                if seasonality_strength > 0.1:  # Significant seasonality
                    seasonal_patterns.append({
                        'type': 'seasonal',
                        'component': component,
                        'period': int(self._estimate_period(values)),
                        'strength': float(seasonality_strength),
                        'confidence': float(min(1.0, seasonality_strength * 2))
                    })
            except:
                continue
        
        return seasonal_patterns

    def _detect_clusters(
        self,
        data: Dict[str, np.ndarray]
    ) -> List[Dict[str, Any]]:
        """Detect clusters in component data."""
        clusters = []
        
        # Combine data for clustering
        combined_data = np.column_stack(list(data.values()))
        
        # Perform clustering
        cluster_labels = self.dbscan.fit_predict(combined_data)
        
        # Analyze clusters
        unique_clusters = np.unique(cluster_labels)
        for cluster_id in unique_clusters:
            if cluster_id != -1:  # Ignore noise points
                mask = cluster_labels == cluster_id
                cluster_data = combined_data[mask]
                
                clusters.append({
                    'type': 'cluster',
                    'cluster_id': int(cluster_id),
                    'size': int(np.sum(mask)),
                    'density': float(np.mean(mask)),
                    'components': list(data.keys()),
                    'centroid': cluster_data.mean(axis=0).tolist(),
                    'variance': cluster_data.var(axis=0).tolist()
                })
        
        return clusters

    def _detect_anomalies(
        self,
        data: Dict[str, np.ndarray]
    ) -> List[Dict[str, Any]]:
        """Detect anomalies in component data."""
        anomalies = []
        
        for component, values in data.items():
            # Fit isolation forest
            predictions = self.isolation_forest.fit_predict(values.reshape(-1, 1))
            
            # Find anomalies
            anomaly_indices = np.where(predictions == -1)[0]
            if len(anomaly_indices) > 0:
                anomalies.append({
                    'type': 'anomaly',
                    'component': component,
                    'indices': anomaly_indices.tolist(),
                    'values': values[anomaly_indices].tolist(),
                    'confidence': float(len(anomaly_indices) / len(values))
                })
        
        return anomalies

    def _granger_causality(
        self,
        x: np.ndarray,
        y: np.ndarray,
        maxlag: int = 5
    ) -> Dict[str, Any]:
        """Perform Granger causality test."""
        try:
            result = grangercausalitytests(
                np.column_stack([x, y]),
                maxlag=maxlag,
                verbose=False
            )
            
            # Extract test results
            causality_results = {}
            for lag in range(1, maxlag + 1):
                test_stats = result[lag][0]
                causality_results[lag] = {
                    'f_stat': float(test_stats['ssr_ftest'][0]),
                    'p_value': float(test_stats['ssr_ftest'][1])
                }
            
            return {
                'maxlag': maxlag,
                'results': causality_results,
                'significant': any(
                    res['p_value'] < 0.05
                    for res in causality_results.values()
                )
            }
        except:
            return {
                'maxlag': maxlag,
                'results': {},
                'significant': False
            }

    def _estimate_period(self, data: np.ndarray) -> int:
        """Estimate the period of seasonal data."""
        # Use autocorrelation to estimate period
        acf = np.correlate(data - np.mean(data), data - np.mean(data), mode='full')
        acf = acf[len(data)-1:]
        
        # Find peaks in autocorrelation
        peaks = np.where((acf[1:] > acf[:-1]) & (acf[1:] > acf[2:]))[0] + 1
        
        if len(peaks) > 0:
            return int(peaks[0])
        else:
            return len(data) // 4  # Default period

    def _calculate_component_influence(
        self,
        G: nx.DiGraph
    ) -> Dict[str, float]:
        """Calculate influence scores for components."""
        # Calculate PageRank
        pagerank = nx.pagerank(G)
        
        # Calculate authority scores
        authority = nx.authority_matrix(G)
        
        # Combine scores
        influence = {}
        for node in G.nodes():
            influence[node] = {
                'pagerank': float(pagerank[node]),
                'authority': float(authority[node]),
                'combined': float((pagerank[node] + authority[node]) / 2)
            }
        
        return influence
