import 'dart:convert';
import 'package:flutter/material.dart';
import '../core/api_service.dart';
import '../core/theme.dart';

// Resolve any avatar/file path to something the image loader can fetch.
// Handles 4 cases: empty, base64 data URI, full http(s) URL, or relative
// /uploads/... path (which we prepend with the live backend host).
String resolveAvatarUrl(String? raw) {
  if (raw == null || raw.isEmpty) return '';
  if (raw.startsWith('http') || raw.startsWith('data:')) return raw;
  final fileBase = ApiService.baseUrl.replaceAll(RegExp(r'/api/?$'), '');
  return raw.startsWith('/') ? '$fileBase$raw' : '$fileBase/$raw';
}

class AvatarWidget extends StatelessWidget {
  final String? imageUrl;
  final String name;
  final double size;
  final double fontSize;

  const AvatarWidget({
    super.key,
    this.imageUrl,
    required this.name,
    this.size = 48,
    this.fontSize = 18,
  });

  String get _initials {
    final parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return name.isNotEmpty ? name[0].toUpperCase() : '?';
  }

  ImageProvider? get _imageProvider {
    final resolved = resolveAvatarUrl(imageUrl);
    if (resolved.isEmpty) return null;
    if (resolved.startsWith('data:image')) {
      try {
        final base64Str = resolved.split(',').last;
        return MemoryImage(base64Decode(base64Str));
      } catch (_) {
        return null;
      }
    }
    return NetworkImage(resolved);
  }

  @override
  Widget build(BuildContext context) {
    final provider = _imageProvider;
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: provider == null
            ? const LinearGradient(
                colors: [AppColors.primary, AppColors.primaryLight],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              )
            : null,
        image: provider != null
            ? DecorationImage(image: provider, fit: BoxFit.cover)
            : null,
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withValues(alpha: 0.15),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: provider == null
          ? Center(
              child: Text(
                _initials,
                style: TextStyle(
                  color: Colors.white,
                  fontSize: fontSize,
                  fontWeight: FontWeight.w800,
                ),
              ),
            )
          : null,
    );
  }
}
