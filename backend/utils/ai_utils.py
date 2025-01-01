from typing import List, Dict, Any, Optional
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans
from sklearn.ensemble import IsolationForest
from datetime import datetime, timedelta

class AIAnalytics:
    def __init__(self):
        self.scaler = StandardScaler()
        self.pca = PCA(n_components=2)
        self.kmeans = KMeans(n_clusters=5, random_state=42)
        self.isolation_forest = IsolationForest(random_state=42)

    def preprocess_data(self, data: np.ndarray) -> np.ndarray:
        """Preprocess data for analysis."""
        if len(data.shape) == 1:
            data = data.reshape(-1, 1)
        return self.scaler.fit_transform(data)

    def detect_patterns(self, data: np.ndarray) -> List[Dict[str, Any]]:
        """Detect patterns in the data using clustering."""
        processed_data = self.preprocess_data(data)
        clusters = self.kmeans.fit_predict(processed_data)
        
        patterns = []
        for cluster_id in range(self.kmeans.n_clusters):
            cluster_data = data[clusters == cluster_id]
            if len(cluster_data) > 0:
                pattern = {
                    'cluster_id': cluster_id,
                    'size': len(cluster_data),
                    'mean': float(np.mean(cluster_data)),
                    'std': float(np.std(cluster_data)),
                    'min': float(np.min(cluster_data)),
                    'max': float(np.max(cluster_data))
                }
                patterns.append(pattern)
        
        return patterns

    def detect_anomalies(self, data: np.ndarray, threshold: float = 0.1) -> List[int]:
        """Detect anomalies using Isolation Forest."""
        processed_data = self.preprocess_data(data)
        predictions = self.isolation_forest.fit_predict(processed_data)
        return list(np.where(predictions == -1)[0])

    def analyze_trends(self, data: np.ndarray, timestamps: List[datetime]) -> Dict[str, Any]:
        """Analyze trends in time series data."""
        if len(data) < 2:
            return {}

        # Calculate basic statistics
        stats = {
            'mean': float(np.mean(data)),
            'std': float(np.std(data)),
            'min': float(np.min(data)),
            'max': float(np.max(data)),
            'range': float(np.ptp(data))
        }

        # Calculate trend
        x = np.arange(len(data))
        coefficients = np.polyfit(x, data, 1)
        trend = {
            'slope': float(coefficients[0]),
            'intercept': float(coefficients[1]),
            'direction': 'increasing' if coefficients[0] > 0 else 'decreasing'
        }

        # Calculate seasonality if enough data points
        if len(data) >= 4:
            fft = np.fft.fft(data)
            frequencies = np.fft.fftfreq(len(data))
            magnitudes = np.abs(fft)
            peak_frequency_idx = np.argmax(magnitudes[1:]) + 1
            seasonality = {
                'period': float(1 / frequencies[peak_frequency_idx]),
                'magnitude': float(magnitudes[peak_frequency_idx])
            }
        else:
            seasonality = None

        return {
            'statistics': stats,
            'trend': trend,
            'seasonality': seasonality
        }

class AICorrelation:
    @staticmethod
    def calculate_correlation(data1: np.ndarray, data2: np.ndarray) -> Dict[str, float]:
        """Calculate various correlation metrics between two datasets."""
        if len(data1) != len(data2):
            raise ValueError("Data arrays must have the same length")

        pearson_corr = float(np.corrcoef(data1, data2)[0, 1])
        
        # Calculate Spearman correlation
        rank1 = np.argsort(np.argsort(data1))
        rank2 = np.argsort(np.argsort(data2))
        spearman_corr = float(np.corrcoef(rank1, rank2)[0, 1])

        # Calculate mutual information score
        try:
            from sklearn.metrics import mutual_info_score
            mi_score = float(mutual_info_score(
                np.digitize(data1, bins=10),
                np.digitize(data2, bins=10)
            ))
        except:
            mi_score = None

        return {
            'pearson': pearson_corr,
            'spearman': spearman_corr,
            'mutual_information': mi_score
        }

    @staticmethod
    def analyze_lag_correlation(
        data1: np.ndarray,
        data2: np.ndarray,
        max_lag: int = 10
    ) -> Dict[str, Any]:
        """Analyze correlation with different time lags."""
        correlations = []
        for lag in range(-max_lag, max_lag + 1):
            if lag < 0:
                d1 = data1[:lag]
                d2 = data2[-lag:]
            elif lag > 0:
                d1 = data1[lag:]
                d2 = data2[:-lag]
            else:
                d1 = data1
                d2 = data2

            if len(d1) > 0 and len(d2) > 0:
                corr = float(np.corrcoef(d1, d2)[0, 1])
                correlations.append({
                    'lag': lag,
                    'correlation': corr
                })

        # Find optimal lag
        max_corr = max(correlations, key=lambda x: abs(x['correlation']))
        
        return {
            'correlations': correlations,
            'optimal_lag': max_corr['lag'],
            'max_correlation': max_corr['correlation']
        }

class AIFeatureExtraction:
    @staticmethod
    def extract_temporal_features(
        data: np.ndarray,
        timestamps: List[datetime]
    ) -> Dict[str, np.ndarray]:
        """Extract temporal features from time series data."""
        features = {}
        
        # Time-based features
        time_diffs = np.diff([ts.timestamp() for ts in timestamps])
        features['time_intervals'] = time_diffs
        features['time_interval_mean'] = np.mean(time_diffs)
        features['time_interval_std'] = np.std(time_diffs)
        
        # Value-based features
        features['rolling_mean'] = np.convolve(data, np.ones(3)/3, mode='valid')
        features['rolling_std'] = np.array([np.std(data[i:i+3]) for i in range(len(data)-2)])
        
        # Derivative features
        features['first_derivative'] = np.diff(data)
        if len(data) > 2:
            features['second_derivative'] = np.diff(data, n=2)
        
        return features

    @staticmethod
    def extract_statistical_features(data: np.ndarray) -> Dict[str, float]:
        """Extract statistical features from data."""
        return {
            'mean': float(np.mean(data)),
            'std': float(np.std(data)),
            'skewness': float(np.mean(((data - np.mean(data)) / np.std(data)) ** 3)),
            'kurtosis': float(np.mean(((data - np.mean(data)) / np.std(data)) ** 4)),
            'median': float(np.median(data)),
            'iqr': float(np.percentile(data, 75) - np.percentile(data, 25)),
            'range': float(np.ptp(data)),
            'entropy': float(-np.sum(np.square(data/np.sum(data)) * np.log2(data/np.sum(data) + 1e-10)))
        }

class AITextAnalysis:
    @staticmethod
    def extract_keywords(text: str, top_k: int = 10) -> List[str]:
        """Extract key phrases from text using basic NLP techniques."""
        try:
            from nltk.tokenize import word_tokenize
            from nltk.corpus import stopwords
            from nltk.tag import pos_tag
            import nltk
            
            # Download required NLTK data
            nltk.download('punkt')
            nltk.download('averaged_perceptron_tagger')
            nltk.download('stopwords')
            
            # Tokenize and remove stopwords
            stop_words = set(stopwords.words('english'))
            words = word_tokenize(text.lower())
            words = [w for w in words if w.isalnum() and w not in stop_words]
            
            # Get POS tags
            tagged = pos_tag(words)
            
            # Extract nouns and verbs
            important_words = [word for word, tag in tagged if tag.startswith(('NN', 'VB'))]
            
            # Get frequency distribution
            freq_dist = nltk.FreqDist(important_words)
            
            return [word for word, _ in freq_dist.most_common(top_k)]
        except Exception as e:
            print(f"Error in keyword extraction: {str(e)}")
            return []

    @staticmethod
    def calculate_sentiment(text: str) -> Dict[str, float]:
        """Calculate sentiment scores for text."""
        try:
            from textblob import TextBlob
            
            blob = TextBlob(text)
            return {
                'polarity': float(blob.sentiment.polarity),
                'subjectivity': float(blob.sentiment.subjectivity)
            }
        except Exception as e:
            print(f"Error in sentiment analysis: {str(e)}")
            return {'polarity': 0.0, 'subjectivity': 0.0}

class AIPromptGeneration:
    @staticmethod
    def generate_analysis_prompt(
        context: Dict[str, Any],
        objective: str,
        constraints: Optional[List[str]] = None
    ) -> str:
        """Generate a structured prompt for AI analysis."""
        prompt_parts = [
            "As an AI wellness assistant, analyze the following information:",
            f"\nObjective: {objective}",
            "\nContext:",
        ]
        
        # Add context details
        for key, value in context.items():
            prompt_parts.append(f"- {key}: {value}")
        
        # Add constraints if provided
        if constraints:
            prompt_parts.append("\nConstraints:")
            for constraint in constraints:
                prompt_parts.append(f"- {constraint}")
        
        prompt_parts.extend([
            "\nPlease provide:",
            "1. Key observations",
            "2. Potential correlations",
            "3. Actionable recommendations",
            "4. Areas for improvement",
            "\nEnsure the response is specific, actionable, and evidence-based."
        ])
        
        return "\n".join(prompt_parts)

    @staticmethod
    def generate_recommendation_prompt(
        user_data: Dict[str, Any],
        area: str,
        preferences: Dict[str, Any]
    ) -> str:
        """Generate a personalized recommendation prompt."""
        prompt_parts = [
            f"Based on the user's {area} data and preferences, provide personalized recommendations.",
            "\nUser Profile:",
            f"- Area of focus: {area}",
        ]
        
        # Add user preferences
        prompt_parts.append("\nPreferences:")
        for key, value in preferences.items():
            prompt_parts.append(f"- {key}: {value}")
        
        # Add relevant data points
        prompt_parts.append("\nRelevant Data:")
        for key, value in user_data.items():
            prompt_parts.append(f"- {key}: {value}")
        
        prompt_parts.extend([
            "\nPlease provide:",
            "1. Short-term recommendations (next 7 days)",
            "2. Medium-term goals (next 30 days)",
            "3. Long-term strategies (next 90 days)",
            "\nEnsure recommendations are:",
            "- Specific and actionable",
            "- Aligned with user preferences",
            "- Evidence-based",
            "- Progressive in difficulty",
        ])
        
        return "\n".join(prompt_parts)
